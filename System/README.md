<p align="center">
<img width=200 src="https://skillicons.dev/icons?i=linux,bash"/>

# Overview

It's service, build on systemd Linux to trace top command at Main\* process every 1 second

These logs're stored 🗃📚 at

`$HOME/log/<date>/<time>.txt`

# Burn it up 🔥

## STEP 1. Connect

1. Download `.zip file`
2. ssh to Gateway (do it yourself, right !!💪)

```
ssh root@<gateway_ip>
```

3. Tranfer 2 file to your Gateway (Stand from your computer)

```
scp mytop.zip root@<gateway_ip>:~
```

@ NOTE replace `<gateway_ip>` to real gateway IP

4. Unzip (Stand from your Gateway)

```
unzip mytop.zip
```

## STEP 2. Build service

1. Make it executed

```
chmod 777 mytop.s*
```

2. Move the service file 🚑 to right place

```
mv ~/mytop.service /etc/systemd/system
```

3. Enable the service

```
systemctl enable mytop.service
```

4. Hell yes 👻, it done !!, reboot

```
reboot
```
