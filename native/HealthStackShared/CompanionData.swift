import Foundation

/// JSON keys must match src/companion/companionTypes.ts
struct CompanionData: Codable {
  var stepsToday: Double?
  var stepsGoal: Double?
  var sleepHoursLastNight: Double?
  var restingHeartRate: Double?
  var waterMlToday: Double?
  var isPro: Bool?
  var updatedAt: String?
  var activeSessionStartedAt: String?
  var activeSessionLabel: String?

  var isSessionActive: Bool { activeSessionStartedAt != nil && activeSessionLabel != nil }

  static let empty = CompanionData()

  static let preview = CompanionData(
    stepsToday: 6420,
    stepsGoal: 10000,
    sleepHoursLastNight: 7.2,
    restingHeartRate: 58,
    waterMlToday: 900,
    isPro: true,
    updatedAt: ISO8601DateFormatter().string(from: Date()),
    activeSessionStartedAt: ISO8601DateFormatter().string(from: Date().addingTimeInterval(-600)),
    activeSessionLabel: "Walk"
  )
}

enum CompanionDataLoader {
  static let appGroup = "group.com.example.healthstack"
  static let widgetKey = "widget_data"

  static func loadFromWidgetDefaults() -> CompanionData {
    guard
      let defaults = UserDefaults(suiteName: appGroup),
      let json = defaults.string(forKey: widgetKey),
      let raw = json.data(using: .utf8),
      let decoded = try? JSONDecoder().decode(CompanionData.self, from: raw)
    else { return .empty }
    return decoded
  }
}
