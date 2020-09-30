$(() => {
    const socket = io()

    const COLORS = [
        '#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#00BCD4',
        '#009688', '#4CAF50', '#FF9800', '#FF5722', '#795548', '#9E9E9E', '#607D8B'
    ]

    const TITLES = [
        'of the Great Barlow', ', Marquess of Salisburry', ', Marquess of Brystol', 'The Wanderer',
        'of the Northern Mountains', 'of the Eastern Seas', 'The Denial', 'The Wise', 'The Abominable',
        'The Forgettable', 'The Chosen One'
    ]

    let username = 'user'

    // set container height for mobile display
    $('#main-container').height(window.innerHeight - 8)

    // username entered
    $('#name').keypress(e => {
        const keycode = e.keyCode || e.which
        if (keycode == '13') {
            username = $('#name').val()
            $('#landing-page').fadeOut(400, () => $(this).remove())
            $('#m').focus()
            socket.emit('user-joined', username)
        }
    })

    // form submitted
    $('form').submit(e => {
        e.preventDefault() // prevents page reloading
        const message = $('#m').val()
        if (message.length == 0) { return }

        console.log('Sending message 🚀')
        const userColor = getUsernameColor(username)
        
        socket.emit('client-sent', {
            message: message,
            userColor: userColor
        })

        $('#m').val('')    // clears input field
        $('#messages').append($('<div>').append($('<li class="user-sent">').text(username).css('color', getUsernameColor(username)))) // append username
        $('#messages').append($('<li class="message-sent">').text(message)) // append message to chat as message-sent
        
        scrollToBottom()

        return false
    })

    // get color from username
    function getUsernameColor(username) {
        let hash = 7;
        
        for (let i = 0; i < username.length; i++) {
            hash = username.charCodeAt(i) + (hash << 5) - hash;
        }

        const index = Math.abs(hash % COLORS.length);
        return COLORS[index];
    }

    // get title from username
    function getUsernameTitle(username) {
        let hash = 7;
        
        for (let i = 0; i < username.length; i++) {
            hash = username.charCodeAt(i) + (hash << 5) - hash;
        }

        const index = Math.abs(hash % TITLES.length);
        return TITLES[index];
    }

    function scrollToBottom() {
        $("#messages").scrollTop($("#messages")[0].scrollHeight)    // scroll to the bottom   
    }

    // append user join or left message
    function appendJoinLeftMessage(joinLeftMessage, count) {
        const countMessage = 'there are ' + count + ' participants.'

        $('#messages').append($('<div>').append($('<li class="secondary-text">').text(joinLeftMessage))) // append message to chat as user joined or left
        $('#messages').append($('<div>').append($('<li class="secondary-text">').text(countMessage))) // append message to chat as participant count

        scrollToBottom()
    }

    socket.on('server-notify-user-joined', data => {
        const joinMessage = data.username + ' ' + getUsernameTitle(data.username) + ' has joined.'
        appendJoinLeftMessage(joinMessage, data.userCount) 
    })

    socket.on('server-notify-user-left', data => {
        const leftMessage = data.username + ' ' + getUsernameTitle(data.username) + ' has left.'
        appendJoinLeftMessage(leftMessage, data.userCount)
    })

    socket.on('server-sent', data => {
        $('#messages').append($('<div>').append($('<li class="user-receive">').text(data.username).css('color', data.userColor))) // append username
        $('#messages').append($('<li class="message-received">').text(data.message)) // append message to chat as message-received

        scrollToBottom()
    })
});