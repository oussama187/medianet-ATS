<!DOCTYPE html>
<html>
<head>
    <title>Application Update</title>
</head>
<body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #6366f1;">MediaNet Career Portal</h2>
        <p>Dear {{ $candidateName }},</p>
        
        <p>We wanted to share a quick update regarding your application for the <strong>{{ $jobTitle }}</strong> position.</p>
        
        <p>Your application has been moved to the following stage: <strong>{{ $stepName }}</strong>.</p>
        
        <p>Our recruitment team is currently reviewing your profile, and we will be in touch soon with further details.</p>
        
        <p>Thank you for your interest in joining our team!</p>
        <br>
        <p>Best regards,<br>The MediaNet Team</p>
    </div>
</body>
</html>
