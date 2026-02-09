{
  "targets": [
    {
      "target_name": "vibrancy",
      "sources": ["vibrancy.mm"],
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")"
      ],
      "defines": ["NAPI_DISABLE_CPP_EXCEPTIONS"],
      "xcode_settings": {
        "OTHER_CPLUSPLUSFLAGS": ["-ObjC++", "-std=c++17"],
        "OTHER_LDFLAGS": [
          "-framework Cocoa",
          "-framework AppKit"
        ]
      }
    }
  ]
}
