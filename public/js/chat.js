let socket = io();
// html elements
const $messageForm = document.querySelector("form");
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormBtn = $messageForm.querySelector('button');
const $locationSendBtn = document.querySelector("#location-btn");
const $messages = document.querySelector("#messages");
const $sidebar = document.querySelector("#sidebar");

// message templates
const messageTemplate = document.querySelector("#message-template").innerHTML
const locationMessageTemplate = document.querySelector("#location-message-template").innerHTML
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML

// options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

// auto scroll
const autoScroll = () => {
    const $newMessage = $messages.lastElementChild

    // new message styles
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // visible height
    const visibleHeight = $messages.offsetHeight

    // height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have i scrolled ?
    const scrollOffset = $messages.scrollTop + visibleHeight
    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }

    // this single ;ine can also achive this
    // $messages.scrollTop = $messages.scrollHeight

}

// join chat-room
socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = "/"
    }
})

socket.on('message', (message) => {
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:m a')
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoScroll();
})

socket.on('locationMessage', (location) => {

    const html = Mustache.render(locationMessageTemplate, {
        username: location.username,
        url: location.url,
        createdAt: moment(location.createdAt).format('h:m a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll();
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    $sidebar.innerHTML = html;
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = $messageFormInput.value;
    if (message === '') return;
    $messageFormBtn.setAttribute('disabled', 'disabled');
    socket.emit('sendMessage', message, (acknowlegedFromServer) => {
        console.log(acknowlegedFromServer);
        $messageFormBtn.removeAttribute('disabled');
        $messageFormInput.value = '';
        $messageFormInput.focus();
    });
})

$locationSendBtn.addEventListener('click', () => {
    if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser.');
        return;
    }
    $locationSendBtn.setAttribute('disabled', 'disabled');
    navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        socket.emit('sendLocation', { lat: latitude, long: longitude }, (akn) => {
            $locationSendBtn.removeAttribute('disabled');
        })
    })
})
