import SwiftUI

struct ActiveSessionView: View {
  @EnvironmentObject var session: WatchSessionManager

  var body: some View {
    VStack(spacing: 12) {
      Text(session.data.activeSessionLabel ?? "Session")
        .font(.headline)
      Text("In progress")
        .foregroundStyle(.secondary)
      if let started = session.data.activeSessionStartedAt,
         let date = ISO8601DateFormatter().date(from: started) {
        Text(date, style: .timer)
          .font(.title.monospacedDigit())
      }
    }
    .padding()
  }
}
