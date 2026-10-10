<!DOCTYPE html>
<html>
<head>
    <title>{{ $subjectLine ?? 'Update on your application' }}</title>
</head>
<body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px;">
    
    <div style="text-align: center; margin-bottom: 30px;">
        <h2 style="color: #3b82f6;">Eternal Cosmic</h2>
    </div>

    <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
        {!! nl2br(e($messageContent)) !!}
    </div>

    <div style="margin-top: 30px; font-size: 12px; color: #94a3b8; text-align: center;">
        <p>&copy; {{ date('Y') }} Eternal Cosmic. All rights reserved.</p>
    </div>
</body>
</html>
