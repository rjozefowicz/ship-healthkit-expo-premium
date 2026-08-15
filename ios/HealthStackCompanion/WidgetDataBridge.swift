import Foundation
import WidgetKit

@objc(WidgetDataBridge)
class WidgetDataBridge: NSObject {

  private let suiteName = "group.com.example.healthstack"
  private let dataKey = "widget_data"

  @objc func updateWidgetData(_ json: String) {
    UserDefaults(suiteName: suiteName)?.set(json, forKey: dataKey)
    if #available(iOS 14.0, *) {
      WidgetCenter.shared.reloadAllTimelines()
    }
  }

  @objc func patchWidgetIsPro(_ isPro: Bool) {
    let defaults = UserDefaults(suiteName: suiteName)
    guard
      let existing = defaults?.string(forKey: dataKey),
      let data = existing.data(using: .utf8),
      var dict = try? JSONSerialization.jsonObject(with: data) as? [String: Any]
    else { return }

    dict["isPro"] = isPro
    if let updated = try? JSONSerialization.data(withJSONObject: dict),
       let str = String(data: updated, encoding: .utf8) {
      defaults?.set(str, forKey: dataKey)
      if #available(iOS 14.0, *) {
        WidgetCenter.shared.reloadAllTimelines()
      }
    }
  }

  @objc static func requiresMainQueueSetup() -> Bool { return false }
}
