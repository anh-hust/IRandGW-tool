# SET UP MANUAL 🤖🤖

- Prerequisite: NodeJS
- Or you can download & install [NodeJS](https://nodejs.org/en/download/current) 🥂

```
npm init -y
```

```
npm install fs mqtt path
```

<h2>Case 1. Listen 📡 specific topic from GW</h2>

```
node main.js <IP_of_Gateway>
```

<h2>Case 2. When you have new GW or change wifi for gateway (so the IP of Gateway will change) </h2>

```
node main.js clean
```

```
node main.js <current_IP_of_Gateway>
```

<h2>Case 3. If you want listen all 🛰 topics from Gateway (in this case do not have to clean)</h2>

```
node main.js <IP_of Gateway>
```
