let normalBox = {
  px: 120,
  py: 1185,
  color: "#df7126",
  epx: 80,
  epy: 100,
  threshold: 10,
};
let speedUpButten = {
  px: 940,
  py: 2340,
  color: "#09439b",
  epx: 50,
  epy: 50,
  threshold: 10,
};
let monsterWarn = {
  px: 1160,
  py: 1700,
  color: "#ee4151",
  epx: 30,
  epy: 100,
  threshold: 15,
};
let mainPackage = {
  px: 80,
  py: 2490,
  color: "#989898",
  epx: 20,
  epy: 40,
  threshold: 10,
};

let challengePoint1 = {
  px: 1100,
  py: 950,
  color: "#0BAC0B",
  epx: 100,
  epy: 50,
  threshold: 10,
};

let challengePoint2 = {
  px: 1000,
  py: 350,
  color: "#161516",
  epx: 50,
  epy: 50,
  threshold: 10,
};
let challengeStart = {
  px: 1750,
  py: 950,
};
let challengeEnd = {
  px: 960,
  py: 950,
};

let dbqbReward1 = {
  color: "#221c11",
  color2: "#3A2807",
  px: 250,
  py: 400,
};
let dbqbReward2 = {
  color: "#221c11",
  color2: "#3A2807",
  px: 1050,
  py: 1950,
};

let dbqbStart = {
  px: 350,
  py: 1060,
};
let dbqbEnd = {
  px: 600,
  py: 2500,
  epx: 50,
  epy: 50,
  color: "#c41100",
  threshold: 15,
};

// const item = require("./itemPoint.js");
// console.show();
setScreenMetrics(2772, 1240);
console.setTitle("0.1");
console.setPosition(500, device.height / 6);
console.setSize(device.width / 10, device.width / 8);

if (auto.service == null) {
  toast("请开启无障碍服务");
  sleep(1000);
  auto.waitFor();
}

// launch("com.pabloleban.IdleSlayer");
// waitForPackage("com.pabloleban.IdleSlayer");

let mode = -1;
let screenMode = 0; // 0 竖屏 1 横屏
let jumpContr = 0;
let modeChange = false;
// 0 正常游戏页面  1 夺宝奇兵 2 挑战模式
let gameMode = 0,
  dbqbCnt = 0;

main();

function main() {
  startSubThread();
  startWarnStopThread();

  let img = images.captureScreen();
  log("width:" + img.width);
  log("height:" + img.height);
  if (img.width > img.height) screenMode = 1;
  else screenMode = 0;

  for (;;) {
    sleep(1000);
    // log("script keep running");
    if (modeChange) {
      // changeModeFun();
      modeChange = false;
    } else {
      if (mode == -1) continue;

      toastLog("gameMode: " + gameMode);
      if (gameMode == 0) {
        normalMode();
      } else if (gameMode == 1) {
        dbqbMode();
      }
    }
  }
}

function changeModeFun() {
  returnMain();
}

function dbqbMode() {
  let img = images.captureScreen();
  if (!isDbqbMode(img)) return;
  if (obtainObj(img, dbqbEnd)) click(dbqbEnd.px, dbqbEnd.py);
  else
    click(
      dbqbStart.px + (dbqbCnt % 3) * 275,
      dbqbStart.py + parseInt(dbqbCnt / 3) * 280
    );
  dbqbCnt++;
  if (dbqbCnt > 15) {
    swipe(
      dbqbStart.px,
      dbqbStart.py + 4 * 280,
      dbqbStart.px,
      dbqbStart.py,
      random(1000, 1500)
    );
    dbqbCnt = 0;
  }
}

function normalMode() {
  let img = images.captureScreen();
  log("screenMode" + "#" + screenMode);
  if (checkInChallengeMode() && screenMode == 1) {
    startChallenge();
    // back()
  } else if (screenMode == 0) {
    handleSpeedUp(img);
    handleBox(img);
    handlejump();
  }
}

function startChallenge() {
  log("ppppp");
  swipe(
    challengeStart.px,
    challengeStart.py,
    challengeEnd.px,
    challengeEnd.py,
    random(1000, 1500)
  );
}

function checkInChallengeMode() {
  let img = images.captureScreen();
  let point1 = obtainObj(img, challengePoint1);
  let point2 = obtainObj(img, challengePoint2);
  return point1 && point2;
}

function obtainObj(img, obj) {
  return images.findColorInRegion(
    img,
    obj.color,
    obj.px,
    obj.py,
    obj.epx,
    obj.epy,
    obj.threshold
  );
}

function handleBox(img) {
  let normalBoxExist = obtainObj(img, normalBox);
  // log("normalBoxExist#" + normalBoxExist);
  if (!normalBoxExist) return;
  click(normalBox.px, normalBox.py);
}

function handleSpeedUp(img) {
  let speedUpButtenExist = obtainObj(img, speedUpButten);
  if (!speedUpButtenExist) return;
  click(speedUpButten.px, speedUpButten.py);
}

function handlejump() {
  if (jumpContr > 0) {
    jumpContr = --jumpContr < 0 ? 0 : jumpContr;
    return;
  }
  click(600, 1000);
}

function returnMain() {
  for (; ; sleep(777)) {
    let img = images.captureScreen();
    let point = obtainObj(img, mainPackage);
    if (point) {
      return;
    }
    back();
  }
}

function startSubThread() {
  if (device.sdkInt > 28) {
    //等待截屏权限申请并同意
    threads.start(function () {
      packageName("com.android.systemui").text("立即开始").waitFor();
      //   text("立即开始").click();
    });
  }

  //申请截屏权限
  if (!requestScreenCapture()) {
    toast("请求截图失败");
    exit();
  }

  threads.start(function () {
    events.observeKey();
    events.onKeyDown("volume_up", function (events) {
      mode = mode * -1;
      if (mode == -1) toast("关闭脚本");
      else toast("脚本已开启");
      modeChange = true;
    });
  });
}

function isDbqbMode(img) {
  let flag1 = images.findMultiColors(
    img,
    dbqbReward1.color,
    [
      [
        dbqbReward2.px - dbqbReward1.px,
        dbqbReward2.py - dbqbReward1.py,
        dbqbReward2.color,
      ],
    ],
    {
      region: [
        dbqbReward1.px - 10,
        dbqbReward1.py - 10,
        dbqbReward2.px - dbqbReward1.px + 10,
        dbqbReward2.py - dbqbReward1.py + 10,
      ],
      threshold: 5,
    }
  );

  let flag2 = images.findMultiColors(
    img,
    dbqbReward1.color,
    [
      [
        dbqbReward2.px - dbqbReward1.px,
        dbqbReward2.py - dbqbReward1.py,
        dbqbReward2.color2,
      ],
    ],
    {
      region: [
        dbqbReward1.px - 10,
        dbqbReward1.py - 10,
        dbqbReward2.px - dbqbReward1.px + 10,
        dbqbReward2.py - dbqbReward1.py + 10,
      ],
      threshold: 5,
    }
  );
  return flag1 || flag2;
}

function startWarnStopThread() {
  threads.start(function () {
    while (true) {
      let img = images.captureScreen();
      // log("width:" + img.width);
      // log("height:" + img.height);
      if (img.width > img.height) screenMode = 1;
      else screenMode = 0;
      if (isDbqbMode(img)) {
        if (gameMode == 0) {
          dbqbCnt = 0;
          gameMode = 1;
        }
        log("夺宝奇兵模式");
      } else {
        gameMode = 0;
        log("普通模式");
      }

      try {
        if (obtainObj(img, monsterWarn)) {
          log("jumpCnt " + jumpContr);
          jumpContr += 1;
          sleep(900);
        }
      } catch (error) {
        log(error);
      }

      if (mode == -1) {
        sleep(3300);
        continue;
      }
      sleep(130);
    }
  });
}
