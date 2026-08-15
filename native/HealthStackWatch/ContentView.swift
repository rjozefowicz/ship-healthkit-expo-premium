import SwiftUI

struct ContentView: View {
  @EnvironmentObject var session: WatchSessionManager

  var body: some View {
    TabView {
      TodayView()
      if session.data.isSessionActive {
        ActiveSessionView()
      }
    }
    .tabViewStyle(.verticalPage)
  }
}
