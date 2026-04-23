package com.techbyjr.alpine.kiosk

import android.os.Bundle
import com.getcapacitor.BridgeActivity
import java.io.InputStream

class MainActivity : BridgeActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // This is where you would traditionally load the game.sh asset
        // Capacitor handles the asset mapping for the WebView automatically.
    }

    /**
     * Helper to read game script from assets in native context
     */
    private fun readGameScript(): String {
        return try {
            val stream: InputStream = assets.open("public/assets/game.sh")
            stream.bufferedReader().use { it.readText() }
        } catch (e: Exception) {
            "echo 'ERROR LOADING SCRIPT'"
        }
    }
}
