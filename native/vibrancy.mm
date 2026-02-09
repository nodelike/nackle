#import <napi.h>
#import <Cocoa/Cocoa.h>

// Private CoreGraphics SPI — same as Terminal.app, iTerm2, Ghostty
extern "C" void *CGSDefaultConnectionForThread();
extern "C" int CGSSetWindowBackgroundBlurRadius(void *connection, unsigned long windowNumber, int radius);

static NSView* GetNSView(Napi::Buffer<void*>& buffer) {
  void* handle = *reinterpret_cast<void**>(buffer.Data());
  return (__bridge NSView*)handle;
}

// setVibrancy(nativeHandle, { blur: true, blurRadius: 20 })
Napi::Value SetVibrancy(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  if (info.Length() < 2 || !info[0].IsBuffer() || !info[1].IsObject()) {
    Napi::TypeError::New(env, "Expected (Buffer, Object)").ThrowAsJavaScriptException();
    return env.Null();
  }

  auto buf = info[0].As<Napi::Buffer<void*>>();
  auto opts = info[1].As<Napi::Object>();

  NSView* nsview = GetNSView(buf);
  if (!nsview || ![nsview window]) {
    Napi::TypeError::New(env, "Invalid native handle").ThrowAsJavaScriptException();
    return env.Null();
  }

  NSWindow* window = [nsview window];
  bool blur = opts.Has("blur") ? opts.Get("blur").As<Napi::Boolean>().Value() : false;
  int blurRadius = opts.Has("blurRadius") ? opts.Get("blurRadius").As<Napi::Number>().Int32Value() : 20;

  // Step 1: Make window non-opaque with near-invisible background
  // This is exactly what Ghostty does: .white.withAlphaComponent(0.001)
  [window setOpaque:NO];
  window.backgroundColor = [NSColor.whiteColor colorWithAlphaComponent:0.001];

  // Step 2: Apply blur via private CGS API
  unsigned long windowNumber = (unsigned long)[window windowNumber];
  void* connection = CGSDefaultConnectionForThread();
  CGSSetWindowBackgroundBlurRadius(connection, windowNumber, blur ? blurRadius : 0);

  // Step 3: Invalidate shadow so macOS recomputes it for the transparent window
  [window invalidateShadow];

  return env.Null();
}

// disableTransparency(nativeHandle)
Napi::Value DisableTransparency(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  if (info.Length() < 1 || !info[0].IsBuffer()) {
    Napi::TypeError::New(env, "Expected (Buffer)").ThrowAsJavaScriptException();
    return env.Null();
  }

  auto buf = info[0].As<Napi::Buffer<void*>>();
  NSView* nsview = GetNSView(buf);
  if (!nsview || ![nsview window]) return env.Null();

  NSWindow* window = [nsview window];

  // Restore opaque window
  [window setOpaque:YES];
  window.backgroundColor = [NSColor colorWithRed:14.0/255.0
                                           green:14.0/255.0
                                            blue:16.0/255.0
                                           alpha:1.0];

  // Remove blur
  unsigned long windowNumber = (unsigned long)[window windowNumber];
  void* connection = CGSDefaultConnectionForThread();
  CGSSetWindowBackgroundBlurRadius(connection, windowNumber, 0);

  [window invalidateShadow];

  return env.Null();
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
  exports.Set("setVibrancy", Napi::Function::New(env, SetVibrancy));
  exports.Set("disableTransparency", Napi::Function::New(env, DisableTransparency));
  return exports;
}

NODE_API_MODULE(vibrancy, Init)
