<!DOCTYPE html>
<html>
<head>
    <title>Update on Your Application</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Dear {{ $candidate->first_name }},</h2>
        
        <p>Thank you for taking the time to apply for the <strong>{{ $candidate->jobListing->title ?? 'open position' }}</strong> and for your interest in joining our team.</p>
        
        <p>We wanted to let you know that we have reviewed your application. While we were impressed with your background and qualifications, we have decided to move forward with other candidates whose experience more closely matches the specific needs of this role at this time.</p>

        <p>We appreciate the time you invested in the process and we will keep your resume in our talent pool for future opportunities that may be a better fit.</p>
        
        <p>We wish you all the best in your job search and future professional endeavors.</p>
        
        <br>
        <p>Sincerely,</p>
        <p><strong>The Recruitment Team</strong></p>
    </div>
</body>
</html>
