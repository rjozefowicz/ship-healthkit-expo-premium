import SwiftUI

struct TodayView: View {
  @EnvironmentObject var session: WatchSessionManager

  var body: some View {
    ScrollView {
      VStack(alignment: .leading, spacing: 10) {
        Text("Today")
          .font(.headline)
        Text("\(Int(session.data.stepsToday ?? 0)) steps")
          .font(.title2.bold())
        if let sleep = session.data.sleepHoursLastNight {
          Text(String(format: "Sleep %.1fh", sleep))
        }
        if let rhr = session.data.restingHeartRate {
          Text("RHR \(Int(rhr)) bpm")
        }
        Button("Refresh") { session.requestSync() }
          .padding(.top, 8)
      }
      .frame(maxWidth: .infinity, alignment: .leading)
      .padding()
    }
    .navigationTitle("Health Stack")
  }
}
