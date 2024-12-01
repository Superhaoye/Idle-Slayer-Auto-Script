// console.show();
setScreenMetrics(2772, 1240);
console.setTitle("0.1");
console.setPosition(500, device.height / 6);
console.setSize(device.width / 6, device.width / 3);

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
      changeModeFun();
      modeChange = false;
    } else {
      if (mode == 1) normalMode();
    }
  }
}

function changeModeFun() {
  returnMain();
}

function normalMode() {
  let img = images.captureScreen();
  log("screenMode" + "#" + screenMode);
  if (checkInChallengeMode() && screenMode == 1) {
    startChallenge();
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
      modeChange = true;
    });
  });
}

function startWarnStopThread() {
  threads.start(function () {
    while (true) {
      let img = images.captureScreen();
      if (img.width > img.height) screenMode = 1;
      else screenMode = 0;

      try {
        if (obtainObj(img, monsterWarn)) {
          log("jumpCnt " + jumpContr);
          jumpContr += 1;
          sleep(900);
        }
      } catch (error) {
        log(error);
      }
      sleep(130);
    }
  });
}
