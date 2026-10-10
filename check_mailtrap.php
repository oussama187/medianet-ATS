<?php
$hostname = '{pop3.mailtrap.io:1100/pop3}INBOX';
$username = '82088c2713632c';
$password = 'd5a3b5bdec563d';

$inbox = imap_open($hostname, $username, $password) or die('Cannot connect to Mailtrap POP3: ' . imap_last_error());
$emails = imap_search($inbox, 'ALL');

if ($emails) {
    rsort($emails);
    foreach (array_slice($emails, 0, 3) as $email_number) {
        $overview = imap_fetch_overview($inbox, $email_number, 0);
        echo "Message ID: {$overview[0]->msgno} - Subject: {$overview[0]->subject} - Date: {$overview[0]->date}\n";
    }
} else {
    echo "No emails found in the inbox.";
}
imap_close($inbox);
