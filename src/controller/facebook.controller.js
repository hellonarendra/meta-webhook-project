class VerifyWebhook {
    webhookVerification(req, res) {
        console.log("Webhook Verification function is called!");
    }
}

exports.webhookVerification = new VerifyWebhook();