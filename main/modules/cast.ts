import { ipcMain } from "electron";
import internalIp from "internal-ip";
import { CastEvents } from "../../shared/constants/CastEvents";
import { Cast } from "../utils/Cast";

const casts = new Cast();

function throwError(message: string, reply: Function) {
  reply("cast-error", message);
}

ipcMain.on(CastEvents.LIST_DEVICES, (e) => {
  e.returnValue = casts.players.map(({ name, host }) => ({
    name,
    host,
  }));
});

ipcMain.on(CastEvents.SET_CAST_DEVICE, (e, id) => {
  casts.selectedPlayer = id
    ? casts.players.find((cast) => cast.host === id)
    : null;

  e.returnValue = !!casts.selectedPlayer;
});

ipcMain.on(
  CastEvents.PLAY_ON_CAST,
  async (e, id: string, url: string, title) => {
    try {
      const ip = await internalIp.v4();
      await casts.play(url.replace("localhost", ip), {
        title,
      });
    } catch (err) {
      throwError(err.message, e.reply);
    }
  }
);

ipcMain.on(CastEvents.SEEK, async (e, time) => {
  try {
    await casts.seek(time);
  } catch (err) {
    throwError(err.message, e.reply);
  }
});

ipcMain.on(CastEvents.PAUSE, async (e) => {
  try {
    await casts.pause();
  } catch (err) {
    throwError(err.message, e.reply);
  }
});

ipcMain.on(CastEvents.STOP, async (e) => {
  try {
    await casts.stop();
  } catch (err) {
    throwError(err.message, e.reply);
  }
});

ipcMain.on(CastEvents.RESUME, async (e) => {
  try {
    await casts.resume();
  } catch (err) {
    throwError(err.message, e.reply);
  }
});

ipcMain.on(CastEvents.STATUS, async (e) => {
  try {
    const status = await casts.status();
    e.reply("cast-progress", status);
  } catch (err) {
    throwError(err.message, e.reply);
  }
});
