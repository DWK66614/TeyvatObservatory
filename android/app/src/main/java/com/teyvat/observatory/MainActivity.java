package com.teyvat.observatory;

import android.os.Bundle;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Bridge;

public class MainActivity extends BridgeActivity {
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    // Enable WebView debugging (Chrome DevTools via USB)
    WebView.setWebContentsDebuggingEnabled(true);
  }
}
