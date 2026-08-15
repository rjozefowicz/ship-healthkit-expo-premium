import Foundation
import WatchConnectivity
import React

@objc(WatchConnectivityBridge)
class WatchConnectivityBridge: RCTEventEmitter, WCSessionDelegate {

  private let suiteName = "group.com.example.healthstack"
  private let widgetKey = "widget_data"
  private let contextKey = "companion_data"
  private var hasListeners = false

  override static func requiresMainQueueSetup() -> Bool { true }

  override func supportedEvents() -> [String]! {
    ["onWatchCommand"]
  }

  override func startObserving() {
    hasListeners = true
  }

  override func stopObserving() {
    hasListeners = false
  }

  override init() {
    super.init()
    guard WCSession.isSupported() else { return }
    WCSession.default.delegate = self
    WCSession.default.activate()
  }

  @objc func pushState(_ json: String) {
    guard WCSession.default.activationState == .activated else { return }
    do {
      try WCSession.default.updateApplicationContext([contextKey: json])
    } catch {}
  }

  @objc func patchIsPro(_ isPro: Bool) {
    let defaults = UserDefaults(suiteName: suiteName)
    guard
      let existing = defaults?.string(forKey: widgetKey),
      let data = existing.data(using: .utf8),
      var dict = try? JSONSerialization.jsonObject(with: data) as? [String: Any]
    else { return }

    dict["isPro"] = isPro
    guard
      let updated = try? JSONSerialization.data(withJSONObject: dict),
      let str = String(data: updated, encoding: .utf8)
    else { return }

    pushState(str)
  }

  func session(
    _ session: WCSession,
    didReceiveMessage message: [String: Any],
    replyHandler: @escaping ([String: Any]) -> Void
  ) {
    DispatchQueue.main.async {
      if self.hasListeners {
        self.sendEvent(withName: "onWatchCommand", body: message)
      }
      replyHandler(["ok": true])
    }
  }

  func session(
    _ session: WCSession,
    activationDidCompleteWith activationState: WCSessionActivationState,
    error: Error?
  ) {}

  func sessionDidBecomeInactive(_ session: WCSession) {}
  func sessionDidDeactivate(_ session: WCSession) {
    session.activate()
  }
}
