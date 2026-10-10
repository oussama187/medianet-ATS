<!DOCTYPE html>
<html>
<head>
    <title>Congratulations! You are Hired</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4CAF50;">Congratulations, {{ $candidate->first_name }}!</h2>
        
        <p>We are absolutely thrilled to inform you that you have been selected for the position of <strong>{{ $candidate->jobListing->title ?? 'the open position' }}</strong>.</p>
        
        <p>Our team was incredibly impressed with your background, skills, and the experience you bring to the table. We believe you will be a fantastic addition to our company.</p>

        <p>Your candidate profile has now been officially transitioned to an Employee record in our system. The HR department will be reaching out to you shortly with your official offer letter and onboarding details.</p>
        
        <p>Welcome aboard! We are excited to start this journey with you.</p>
        
        <br>
        <p>Warm regards,</p>
        <p><strong>The Recruitment Team</strong></p>
    </div>
</body>
</html>
