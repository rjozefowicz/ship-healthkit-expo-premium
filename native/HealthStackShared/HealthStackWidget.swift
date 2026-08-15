import Foundation
import SwiftUI
import WidgetKit

private struct HealthStackEntry: TimelineEntry {
  let date: Date
  let data: CompanionData
}

private struct HealthStackProvider: TimelineProvider {
  func placeholder(in context: Context) -> HealthStackEntry {
    HealthStackEntry(date: Date(), data: .preview)
  }

  func getSnapshot(in context: Context, completion: @escaping (HealthStackEntry) -> Void) {
    completion(HealthStackEntry(date: Date(), data: CompanionDataLoader.loadFromWidgetDefaults()))
  }

  func getTimeline(in context: Context, completion: @escaping (Timeline<HealthStackEntry>) -> Void) {
    let entry = HealthStackEntry(date: Date(), data: CompanionDataLoader.loadFromWidgetDefaults())
    completion(Timeline(entries: [entry], policy: .after(Date().addingTimeInterval(15 * 60))))
  }
}

private struct HealthStackWidgetView: View {
  let data: CompanionData

  var body: some View {
    VStack(alignment: .leading, spacing: 8) {
      Text("Health Stack")
        .font(.caption.weight(.semibold))
        .foregroundStyle(.secondary)
      Text("\(Int(data.stepsToday ?? 0))")
        .font(.system(size: 28, weight: .bold, design: .rounded))
      Text("steps today")
        .font(.caption)
        .foregroundStyle(.secondary)
      if let sleep = data.sleepHoursLastNight {
        Text(String(format: "Sleep %.1fh", sleep))
          .font(.caption2)
          .foregroundStyle(.secondary)
      }
      if data.isSessionActive {
        Text(data.activeSessionLabel ?? "Session")
          .font(.caption.weight(.semibold))
          .foregroundStyle(.blue)
      }
      Spacer(minLength: 0)
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
    .padding(12)
  }
}

struct HealthStackWidget: Widget {
  let kind = "HealthStackWidget"

  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: HealthStackProvider()) { entry in
      HealthStackWidgetView(data: entry.data)
        .containerBackground(.fill.tertiary, for: .widget)
    }
    .configurationDisplayName("Health Stack")
    .description("Steps, sleep, and active session.")
    .supportedFamilies([.systemSmall, .systemMedium])
  }
}
