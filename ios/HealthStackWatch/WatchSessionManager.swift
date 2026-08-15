import Foundation
import WatchConnectivity

final class WatchSessionManager: NSObject, ObservableObject, WCSessionDelegate {
  static let shared = WatchSessionManager()

  @Published var data: CompanionData = .empty

  private override init() {
    super.init()
    if WCSession.isSupported() {
      let session = WCSession.default
      session.delegate = self
      session.activate()
    }
    loadCached()
  }

  func requestSync() {
    guard WCSession.default.isReachable else { return }
    WCSession.default.sendMessage(["action": "request_sync"], replyHandler: nil) { _ in }
  }

  private func loadCached() {
    data = CompanionDataLoader.loadFromWidgetDefaults()
  }

  private func apply(json: String) {
    guard let raw = json.data(using: .utf8),
          let decoded = try? JSONDecoder().decode(CompanionData.self, from: raw)
    else { return }
    DispatchQueue.main.async {
      self.data = decoded
    }
    UserDefaults(suiteName: CompanionDataLoader.appGroup)?.set(json, forKey: CompanionDataLoader.widgetKey)
  }

  func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {}

  func session(_ session: WCSession, didReceiveApplicationContext applicationContext: [String: Any]) {
    if let json = applicationContext["companion_data"] as? String {
      apply(json: json)
    }
  }

  func session(_ session: WCSession, didReceiveMessage message: [String: Any]) {
    if let json = message["companion_data"] as? String {
      apply(json: json)
    }
  }
}
