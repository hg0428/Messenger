from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render
import random
from django.contrib.auth.models import User
from .models import Chat, Message, UserReceived, Client
import json
import datetime
from django.core import serializers

system = User.objects.filter(username="system").first()
if system is None:
    system = User.objects.create_user(
        username="system", email="system", password="Password"
    )


def set_cookie(response, key, value, days_expire=7):
    max_age = days_expire * 24 * 60 * 60
    expires = datetime.datetime.strftime(
        datetime.datetime.utcnow() + datetime.timedelta(seconds=max_age),
        "%a, %d-%b-%Y %H:%M:%S GMT",
    )
    response.set_cookie(
        key,
        value,
        max_age=max_age,
        expires=expires,
    )


# Create your views here.
def index(request):
    if not request.user.is_authenticated:
        # redirect to login
        return HttpResponseRedirect(reverse("login"))
    serialized_user = {
        "id": request.user.id,
        "username": request.user.username,
        "email": request.user.email,
        "chats": {
            chat.id: {
                "id": chat.id,
                "name": chat.name,
                "messages": [],
                "users": [user.id for user in chat.users.all()],
            }
            for chat in request.user.chats.all()
        },
    }
    client_registered = "true" if "Client-id" in request.COOKIES else "false"
    return render(
        request,
        "index.html",
        {
            "r": random.randint(0, 9999999),
            "user": request.user,
            "serialized_user": json.dumps(serialized_user),
            "all_users": {
                user.id: {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "value": user.id,
                    "clients": {},
                }
                for user in User.objects.all()
            },
            "client_registered": client_registered,
        },
    )


def login_view(request):
    if request.method != "POST":
        return render(request, "login.html")
    # Attempt to sign user in
    username = request.POST["username"]
    password = request.POST["password"]
    user = authenticate(request, username=username, password=password)
    if user is None:
        return render(
            request,
            "login.html",
            {"message": "Invalid username and/or password."},
        )
    login(request, user)
    return HttpResponseRedirect(reverse("index"))


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("login"))


def register(request):
    if request.method != "POST":
        return render(request, "register.html")
    username = request.POST["username"]
    email = request.POST["email"]

    # Ensure password matches confirmation
    password = request.POST["password"]
    confirmation = request.POST["confirmation"]
    if password != confirmation:
        return render(
            request, "register.html", {"message": "Passwords must match."}
        )

    # Attempt to create new user
    try:
        user = User.objects.create_user(username, email, password)
        user.save()
    except IntegrityError:
        return render(
            request, "register.html", {"message": "Username already taken."}
        )
    login(request, user)
    return HttpResponseRedirect(reverse("index"))


@csrf_exempt
def API(request):
    if not request.user.is_authenticated:
        return HttpResponse("Access Denied")
    if request.method != "POST":
        return HttpResponse("Not OK")
    ret = {"errors": []}
    cookies = []
    actions = json.loads(request.body)["actions"]
    client = None
    if "Client-id" in request.COOKIES:
        client = Client.objects.get(
            id=request.COOKIES["Client-id"], user=request.user
        )
    else:
        clients = Client.objects.filter(user=request.user)
        if len(clients) != 0:
            client = clients[0]
            cookies.append({"name": "Client-id", "value": client.id, "max-age": 360})
    for data in actions:
        action = data["action"]
        if action == "add-client":
            print("HERE")
            client = Client(
                user=request.user,
                peerId=data.get("peer-id", None),
                publicKey=data.get("public-key", None),
            )
            client.save()
            for chat in request.user.chats.all():
                userReceivedObject = UserReceived(client=client, chat=chat)
                userReceivedObject.save()
            client.save()
            cookies.append({"name": "Client-id", "value": client.id, "max-age": 360})
        elif action == "create-chat":
            print("CREATING CHAT...")
            chat = Chat(
                name=data["name"],
            )
            chat.save()
            data["users"].append(request.user.id)
            for id in data["users"]:
                try:
                    user = User.objects.get(id=id)
                except:
                    # print("ERROR")
                    ret["errors"].append(f"User {user} does not exist")
                chat.users.add(user)
                for c in user.clients.all():
                    userReceivedObject = UserReceived(client=c, chat=chat)
                    userReceivedObject.save()
            ret["chat"] = {
                "id": chat.id,
                "name": chat.name,
                "messages": [],
                "users": [user.id for user in chat.users.all()],
            }
        elif action == "get-chat":
            chat = Chat.objects.get(id=data["chat-id"])
            serialized_chat = json.loads(serializers.serialize("json", [chat]))[0][
                "fields"
            ]
            serialized_chat["users"] = [
                json.loads(serializers.serialize("json", [user]))[0]["fields"]
                for user in chat.users.all()
            ]
            ret["chat"] = serialized_chat
        elif action == "get-chats":
            ret["chats"] = {
                chat.id: {
                    "id": chat.id,
                    "name": chat.name,
                    "messages": [],
                    "users": [user.id for user in chat.users.all()],
                }
                for chat in request.user.chats.all()
            }
        elif action == "get-current-users":
            chat = Chat.objects.get(id=data["chat-id"])
            # Make sure the user is in that chat.
            if chat not in request.user.chats.all():
                ret["errors"].append(
                    "You are not in that chat. You cannot get current users."
                )
            users = chat.users.all()
            serialized_users = {
                user.id: {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "value": user.id,
                    "clients": {
                        c.id: {
                            "id": c.id,
                            "peerId": c.peerId,
                            "publicKey": c.publicKey,
                        }
                        for c in user.clients.all()
                    },
                }
                for user in users
            }
            ret["users"] = serialized_users
        elif action == "get-messages":
            if client is None:
                ret["errors"].append("Client is required to access messages.")
            chat = Chat.objects.get(id=data["chat-id"])
            print(UserReceived.objects.all()[0].messages)
            userReceivedObject = UserReceived.objects.get(chat=chat, client=client)
            messages = userReceivedObject.messages.all().order_by("timestamp")
            print(messages, data)
            end = data.get("end", -1)
            start = data.get("start", -1)
            end = len(messages) + end + 1 if end < 0 else end
            start = len(messages) + start + 1 if start < 0 else start
            print(messages)
            serialized_messages = {
                message.id: {
                    "index": index,
                    "id": message.id,
                    "sender": {
                        "id": message.sender.id,
                    },
                    "content": message.content,
                    "timestamp": message.timestamp.isoformat(),
                    "encrypted": message.encrypted,
                }
                for index, message in enumerate(messages)
                if index >= start and index < end
            }
            ret["messages"] = serialized_messages
        elif action == "leave-chat":
            chat = Chat.objects.get(id=data["chat-id"])
            chat.users.remove(request.user)
            if chat.users.count() == 0:
                chat.delete()
            else:
                for user in chat.users:
                    for c in user.clients.all():
                        message = Message(
                            sender=system,
                            content=f"@{request.user.username} left the chat.",
                        )
                        userReceivedObject = UserReceived(client=c, chat=chat)
                        userReceivedObject.save()
                        message.userReceivedObject = userReceivedObject
                        message.save()
        elif action == "send-message":
            print("sending message")
            user = User.objects.get(id=data["destination-user"])
            dest_client = Client.objects.get(
                user=user, id=data["destination-client"]
            )
            # Get the user recieved object for the chat and user
            userReceivedObject = UserReceived.objects.get(
                chat=Chat.objects.get(id=data["chat-id"]), client=dest_client
            )
            message = Message(
                sender=request.user,
                content=data["content"],
                userRecievedObject=userReceivedObject,
                encrypted=data.get("encrypted", False),
            )
            message.save()
        elif action == "set-client-data":
            if client is None:
                ret["errors"].append("Client is required to set data.")
            if "peer-id" in data:
                client.peerId = data["peer-id"]
            if "public-key" in data:
                client.publicKey = data["public-key"]
            client.save()
    response = HttpResponse(json.dumps(ret), content_type="application/json")
    print(cookies)
    for cookie in cookies:
        set_cookie(response, cookie["name"], cookie["value"], cookie["max-age"])
    return response


# https://www.honeybadger.io/blog/django-channels-websockets-chat/
