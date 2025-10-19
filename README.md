# Infoscreen

## Features to be implemented
- Dashboard
  - Upcoming ilmos (from Ilmo)
  - Kiltiskamera viewers (from Kiltiskamera backend)
  - Ruokalista (from Kanttiinit API)
  - Sponsors
- Full screen rotating slides (image from Django API)
- Time and date

## Building and deploying

SSH into Raspberry Pi, clone new contents of the repo and run:

```
npm install
export VITE_KILTISKAMERA_ON_AIR_PASSWORD=secretpassword && npm build
```
secretpassword value can be looked up from the Azure environment values for kiltiskamera app.

There is a systemd service in /etc/systemd/system/infoscreen.service which runs the preview server. Chrome is started on boot in kiosk mode and the configuration is in ~/.config/autostart/infoscreen.desktop.
