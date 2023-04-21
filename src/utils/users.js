const users = [];

const addUser = ({ id, username, room }) => {
    // cleanup the data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    // validate the data
    if (!username || !room) {
        return {
            error: "username and room required!"
        }
    }

    // check for existing user
    const isExists = users.find(user => {
        return user.username === username && user.room === room
    })

    if (isExists) return { error: "username is in use!" }

    // store user
    const user = { id, username, room }
    users.push(user)
    return { user }
}
const removeUser = (id) => {
    const index = users.findIndex(user => user.id === id);
    if (index !== -1) return users.splice(index, 1)[0]
}
const getUser = (id) => users.find(user => user.id === id)
const getUsersFromRoom = room => users.filter(user => user.room === room)

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersFromRoom
}