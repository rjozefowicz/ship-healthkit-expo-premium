import WidgetKit
import SwiftUI
internal import ExpoWidgets

@main
struct ExportWidgets0: WidgetBundle {
  var body: some Widget {
    
    HealthStackWidget()
    WidgetLiveActivity()
  }
}

// MARK: - HealthStack home-screen widget (native Swift)
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

private extension View {
  @ViewBuilder
  func hsWidgetBackground(_ style: some ShapeStyle) -> some View {
    if #available(iOSApplicationExtension 17.0, iOS 17.0, *) {
      containerBackground(style, for: .widget)
    } else {
      background(Rectangle().fill(style))
    }
  }
}

private struct HealthStackWidgetView: View {
  let data: CompanionData

  var body: some View {
    VStack(alignment: .leading, spacing: 8) {
      Text("Health Stack")
        .font(.caption.weight(.semibold))
        .foregroundStyle(Color.hsTextSec)
      Text("\(Int(data.stepsToday ?? 0))")
        .font(.system(size: 28, weight: .bold, design: .rounded))
        .foregroundStyle(Color.hsText)
      Text("steps today")
        .font(.caption)
        .foregroundStyle(Color.hsTextSec)
      if let sleep = data.sleepHoursLastNight {
        Text(String(format: "Sleep %.1fh", sleep))
          .font(.caption2)
          .foregroundStyle(Color.hsTextSec)
      }
      if data.isSessionActive {
        Text(data.activeSessionLabel ?? "Session")
          .font(.caption.weight(.semibold))
          .foregroundStyle(Color.hsAccent)
      }
      Spacer(minLength: 0)
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
    .padding(12)
    .hsWidgetBackground(Color.hsBg)
  }
}

struct HealthStackWidget: Widget {
  let kind = "HealthStackWidget"

  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: HealthStackProvider()) { entry in
      HealthStackWidgetView(data: entry.data)
    }
    .configurationDisplayName("Health Stack")
    .description("Steps, sleep, and active session.")
    .supportedFamilies([.systemSmall, .systemMedium])
  }
}
