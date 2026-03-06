<?php

namespace App\Mail;

use App\Models\NewsletterSubscriber;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class NewsletterMail extends Mailable
{
    use SerializesModels;

    public function __construct(
        private string $subject,
        private string $bodyHtml,
        private NewsletterSubscriber $subscriber
    ) {}

    public function build()
    {
        return $this->subject($this->subject)
            ->view('emails.newsletter', [
                'body'            => $this->bodyHtml,
                'subscriberName'  => $this->subscriber->name ?? '',
                'unsubscribeUrl'  => config('app.url') . '/newsletter/unsubscribe?token=' . $this->subscriber->token,
                'brandName'       => \App\Models\Setting::getValue('brand_name', 'Cafrezzo'),
                'color'           => \App\Models\Setting::getValue('color_primary', '#3C7A58'),
            ]);
    }
}
