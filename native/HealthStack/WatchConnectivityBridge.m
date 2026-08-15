#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(WatchConnectivityBridge, RCTEventEmitter)

RCT_EXTERN_METHOD(pushState:(NSString *)json)
RCT_EXTERN_METHOD(patchIsPro:(BOOL)isPro)

@end
