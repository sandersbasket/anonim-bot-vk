const easyvk = require('easyvk');
const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('./users.db', sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the database.');
});

function adduser(name, VK, table) {
  db.run("insert into "+ table +" (name, user_id) values ('" + name + "','" + VK + "')");
}

easyvk({
    token: 'tokeb',
    reauth: true,
    v: '5.103' 
  }).then(async vk => {

    let connection = await vk.bots.longpoll.connect();
  
    connection.on("message_new", async (msg) => {
      console.log(msg)

      function messagesend(user_id, text) {
        vk.call('messages.send', {
          peer_id: msg.message.peer_id,
          random_id: easyvk.randomId(),
          message: text
        });
      }

      if (msg.message.text.startsWith('/reg')) {
        let getuserid = msg.message.text .match(/\/reg id(\d+) (.+)/);
        let sql = "SELECT name, user_id from user_info";
        db.get(sql, (err, rows) => {
          if (rows === null || rows === undefined) {
            messagesend(msg.message.peer_id, 'error');
          }
          else if (rows != null && err === null && getuserid[1] != rows.user_id) {
            adduser(getuserid[2], getuserid[1], 'user_info')
            messagesend(msg.message.peer_id, 'Добавил в базу данных: \n id: ' + getuserid[1] + ' | name: ' + getuserid[2])
          }
          else if (rows.user_id.toString() === getuserid[1].toString()) {
            if (rows.user_id.toString() === getuserid[1].toString()) {
              if (rows.user_id.toString() === getuserid[1].toString()) {
                messagesend(msg.message.peer_id, 'Вы уже находитесь в базе!')
              }
            }
          }
        })
      }
      if (msg.message.text != null || msg.message.text != '' || msg.message.attachments.type != 'sticker') {
        let getinfomessage = msg.message.text.match(/(.+)/)
        let sql = `SELECT user_id, name from user_info`;
        let arr = [];
        let name;
        let sql1 = "SELECT name from user_info where user_id = '" + msg.message.from_id + "'";

        db.get(sql1, (err, rows) => {
          if (rows === null || rows === undefined) {
            messagesend(msg.message.peer_id, 'error');
          }
          else if (rows != null && err === null) {
            name = rows.name
            console.log(rows.name)
          }
        })

        db.all(sql, [], (err, rows) => {
          if (err) {
            throw err;
          }
          rows.forEach((row) => {
            arr.push(row)
          });
          for (i = 0; i < arr.length; i++) {
            if (arr[i].user_id != msg.message.from_id) {
              messagesend(arr[i].user_id, name + ": " + getinfomessage[1])
            }
          }
        });
      }
      if (msg.message.text == '/help') {
        messagesend(msg.message.peer_id, '/reg [id] [name]')
      }
    })
  })


