var inputElm = document.getElementById('users-list-tagify-input');

function tagTemplate(tagData) {
    return `
        <tag title="${tagData.email}"
                contenteditable='false'
                spellcheck='false'
                tabIndex="-1"
                class="tagify__tag ${tagData.class ? tagData.class : ""}"
                ${this.getAttributes(tagData)}>
            <x title='' class='tagify__tag__removeBtn' role='button' aria-label='remove tag'></x>
            <div>
                <div class='tagify__tag__avatar-wrap'>
                    <img onerror="this.style.visibility='hidden'" src="${tagData.avatar || '/static/person-circle.svg'}">
                </div>
                <span class='tagify__tag-text'>${tagData.username}</span>
            </div>
        </tag>
    `
}

function suggestionItemTemplate(tagData) {
    return `
        <div ${this.getAttributes(tagData)}
            class='tagify__dropdown__item ${tagData.class ? tagData.class : ""}'
            tabindex="0"
            role="option">
            <div class='tagify__dropdown__item__avatar-wrap'>
                <img onerror="this.style.visibility='hidden'" src="${tagData.avatar || '/static/person-circle.svg'}">
            </div>
        <strong> ${tagData.username}</strong>
            <span>${tagData.email}</span>
        </div >
        `
}

function dropdownHeaderTemplate(suggestions) {
    return `
        <div class="${this.settings.classNames.dropdownItem} ${this.settings.classNames.dropdownItem}__addAll">
            <strong>${this.value.length ? `Add remaining ${suggestions.length}` : 'Add All'}</strong>
            <span>${suggestions.length} members</span>
        </div>
        `
}

// initialize Tagify on the above input node reference
var tagify = new Tagify(inputElm, {
    tagTextProp: 'name', // very important since a custom template is used with this property as text
    // enforceWhitelist: true,
    skipInvalid: true, // do not temporarily add invalid tags
    dropdown: {
        closeOnSelect: false,
        enabled: 0,
        classname: 'users-list',
        searchKeys: ['username', 'email', 'id'] // very important to set by which keys to search for suggestions when typing
    },
    templates: {
        tag: tagTemplate,
        dropdownItem: suggestionItemTemplate,
        dropdownHeader: dropdownHeaderTemplate
    },
    whitelist: Object.values(allUsers),
    transformTag: (tagData, originalData) => {
        var { username, email } = parseFullValue(tagData.username)
        tagData.username = username
        tagData.email = email || tagData.email
    },
    validate({ username, email }) {
        // when editing a tag, there will only be the "username" property which contains username + email (see 'transformTag' above)
        if (!email && username) {
            var parsed = parseFullValue(username)
            username = parsed.username
            email = parsed.email
        }

        if (!username) return "Missing username"
        if (!validateEmail(email)) return "Invalid email"

        return true
    }
})

// attach events listeners
tagify.on('dropdown:select', onSelectSuggestion) // allows selecting all the suggested (whitelist) items
    .on('edit:start', onEditStart)  // show custom text in the tag while in edit-mode

function onSelectSuggestion(e) {
    // custom class from "dropdownHeaderTemplate"
    if (e.detail.elm.classList.contains(`${tagify.settings.classNames.dropdownItem} __addAll`))
        tagify.dropdown.selectAll();
}

function onEditStart({ detail: { tag, data } }) {
    tagify.setTagTextNode(tag, `${data.username} <${data.email}>`)
}

// https://stackoverflow.com/a/9204568/104380
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function parseFullValue(value) {
    // https://stackoverflow.com/a/11592042/104380
    var parts = value.split(/<(.*?)>/g),
        username = parts[0].trim(),
        email = parts[1]?.replace(/<(.*?)>/g, '').trim();

    return { username, email }
}