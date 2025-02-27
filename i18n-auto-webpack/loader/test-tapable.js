const { AsyncSeriesHook } = require("tapable");

const hook = new AsyncSeriesHook();

// 注册回调
hook.tapAsync("test", (cb) => {
  console.log("callback A");
  setTimeout(() => {
    console.log("callback A 异步操作结束");
    // 回调结束时，调用 cb 通知 tapable 当前回调已结束
    cb();
  }, 100);
});

hook.tapAsync("test", () => {
  console.log("callback B");
});

hook.callAsync();
// 运行结果：
// callback A
// callback A 异步操作结束
// callback B
