from django.db import models

# Create your models here.
from django.contrib.auth.models import User
from django.db import models


def initListField():
    return []


initPublicKeyField = initListField


class Client(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="clients")
    id = models.AutoField(primary_key=True)
    peerId = models.CharField(max_length=200, null=True)
    publicKey = models.CharField(max_length=200, null=True)


class Chat(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    users = models.ManyToManyField(User, related_name="chats")


class UserReceived(models.Model):
    # This is per client per chat
    client = models.ForeignKey(
        Client, on_delete=models.CASCADE, related_name="received"
    )
    id = models.AutoField(primary_key=True)
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, null=True)


class Message(models.Model):
    id = models.AutoField(primary_key=True)
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    userRecievedObject = models.ForeignKey(
        UserReceived, on_delete=models.CASCADE, null=True, related_name="messages"
    )
    encrypted = models.BooleanField(default=False)
