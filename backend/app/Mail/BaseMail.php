<?php

namespace App\Mail;

use App\Models\MailTemplate;
use App\Models\Setting;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

abstract class BaseMail extends Mailable
{
    use SerializesModels;

    protected string $templateKey;
    protected array  $vars = [];

    /**
     * Build the message using the admin-editable DB template if it exists,
     * otherwise fall back to the static Blade view.
     */
    public function build()
    {
        $template = MailTemplate::findByKey($this->templateKey);
        $locale   = $this->getLocale();

        $brandName = Setting::getValue('brand_name', 'Cafrezzo');
        $logo      = Setting::getValue('logo_path', '');
        $color     = Setting::getValue('color_primary', '#3C7A58');

        if ($template) {
            $subject = $template->getSubject($this->vars, $locale);
            $body    = $template->getBody($this->vars, $locale);

            return $this->subject($subject)
                ->view('emails.layout', [
                    'body'      => $body,
                    'brandName' => $brandName,
                    'logo'      => $logo,
                    'color'     => $color,
                ]);
        }

        // Fallback to static blade view
        return $this->subject($this->getFallbackSubject())
            ->view("emails.{$this->templateKey}", array_merge($this->vars, [
                'brandName' => $brandName,
                'logo'      => $logo,
                'color'     => $color,
                'locale'    => $locale,
            ]));
    }

    protected function getLocale(): string
    {
        return 'fr'; // Subclasses override if they have user context
    }

    protected function getFallbackSubject(): string
    {
        return 'Cafrezzo';
    }
}
