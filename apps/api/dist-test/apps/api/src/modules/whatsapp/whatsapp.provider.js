"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZApiWhatsAppSender = exports.EvolutionWhatsAppSender = exports.MockWhatsAppSender = void 0;
exports.makeWhatsAppSender = makeWhatsAppSender;
function getDeliveryMode() {
    return process.env.WHATSAPP_DELIVERY_MODE === "production" ? "production" : "dry-run";
}
class MockWhatsAppSender {
    async sendGroupMessage() {
        return {
            providerMessageId: `mock-${Date.now()}`,
            echoed: true,
            mode: getDeliveryMode(),
        };
    }
}
exports.MockWhatsAppSender = MockWhatsAppSender;
class EvolutionWhatsAppSender {
    async sendGroupMessage(input) {
        const mode = getDeliveryMode();
        return {
            providerMessageId: mode === "production" ? `evolution-prod-${Date.now()}` : `evolution-dry-run-${input.groupId}`,
            echoed: mode !== "production",
            mode,
        };
    }
}
exports.EvolutionWhatsAppSender = EvolutionWhatsAppSender;
class ZApiWhatsAppSender {
    async sendGroupMessage(input) {
        const mode = getDeliveryMode();
        return {
            providerMessageId: mode === "production" ? `zapi-prod-${Date.now()}` : `zapi-dry-run-${input.groupId}`,
            echoed: mode !== "production",
            mode,
        };
    }
}
exports.ZApiWhatsAppSender = ZApiWhatsAppSender;
function makeWhatsAppSender(provider) {
    if (provider === "evolution")
        return new EvolutionWhatsAppSender();
    if (provider === "zapi")
        return new ZApiWhatsAppSender();
    return new MockWhatsAppSender();
}
