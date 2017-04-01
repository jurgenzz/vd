# vd

IRC chatbot that informs you about who has a name day today.
Usage:
```
npm install
```
create app/config.js:
```
{
    "host": "", //irc host, e.g. chat.freenode.net
    "port": 6667, // irc port
    "tls": false,
    "nick": "",
    "username": "",
    "password": "",
    "channels": ["#meeseekeria"] // array of channels to join
}
```
then
```
npm start
```
Commands:
```
!vd // returns name days today
!vd name // returns which date "name" has a nameday
!ping // pong
```

For more commands, add an object to `app/commands.js`, containing regex, that should match your commant and action,
that will be done if regex is matched: 
```
    {
        regex: '!ping',
        action: (event) => {
             event.reply('pong');
        }
    }
```
