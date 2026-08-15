#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(WidgetDataBridge, NSObject)

RCT_EXTERN_METHOD(updateWidgetData:(NSString *)json)
RCT_EXTERN_METHOD(patchWidgetIsPro:(BOOL)isPro)

+ (BOOL)requiresMainQueueSetup { return NO; }

@end
