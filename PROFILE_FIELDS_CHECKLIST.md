# Sign-Up Profile Fields Comprehensive Checklist

## Currently Collected Fields (Step 4: Complete Profile)

### ✅ Personal Details Section
- **Full Name** * (Required)
  - Type: Text input
  - Validation: Non-empty
  - Used for: Display name, avatar generation, profile header
  
- **College/University** * (Required)
  - Type: Text input
  - Validation: Non-empty
  - Used for: Community filtering, networking
  
- **Current Role** (Optional)
  - Type: Select dropdown
  - Options: Student, Developer, Designer, Product Manager, Founder, Marketer, Other
  - Used for: Profile badging, role-based community suggestions
  
### ✅ Professional Links Section
- **GitHub Profile** (Optional)
  - Type: URL input
  - Format: https://github.com/username
  - Used for: Portfolio verification, project linking
  
- **LinkedIn Profile** (Optional)
  - Type: URL input
  - Format: https://linkedin.com/in/username
  - Used for: Professional credibility, network expansion
  
- **Resume/CV** (Optional)
  - Type: File upload (PDF, DOC, DOCX)
  - Size: Recommended < 5MB
  - Used for: Hiring visibility, professional profile
  - Note: In production, upload to S3/cloud storage
  
### ✅ Skills & Expertise Section
- **Skills** * (Required - minimum 1)
  - Type: Tag input with add button
  - Examples: React, Python, UI Design, Product Strategy
  - Used for: Skill-based matching, community recommendations
  - UX: Enter skill + Press Enter or click Add button
  
### ✅ Interests & Passions Section
- **Interests** (Optional but highly recommended)
  - Type: Tag input with add button
  - Examples: Open Source, Startups, Gaming, Web3, Climate Tech
  - Used for: Interest-based communities, project matching
  - UX: Enter interest + Press Enter or click Add button
  
### ✅ About You Section
- **Bio** (Optional)
  - Type: Textarea (500 char limit)
  - Placeholder: "Tell the community about yourself, your journey, and what you're passionate about"
  - Used for: Profile summary, community introduction
  
### ✅ Static Information
- **Email** (Automatic)
  - Value: team@nexora.app (static)
  - Display only, no editing
  
---

## Potentially Relevant Fields (Not Yet Implemented)

### Consider Adding:
1. **Portfolio/Personal Website**
   - Type: URL input
   - Used for: Direct portfolio access
   - Priority: Medium

2. **Years of Experience**
   - Type: Number/Select (0-1, 1-3, 3-5, 5-10, 10+ years)
   - Used for: Seniority-based filtering
   - Priority: Medium

3. **Availability Status**
   - Type: Select (Looking for opportunity, Open to opportunities, Not available)
   - Used for: Recruitment/collaboration filtering
   - Priority: Low

4. **Preferred Tech Stack/Languages**
   - Type: Multi-select checkboxes
   - Options: Frontend, Backend, Full Stack, Mobile, DevOps, Data Science, Design, etc.
   - Used for: Team composition suggestions
   - Priority: Medium

5. **Location** (Optional)
   - Type: Text or geocoded input
   - Used for: Local community suggestions, timezone filtering
   - Priority: Low

6. **Phone Visibility**
   - Type: Toggle (Show phone to community / Private)
   - Used for: Contact preferences
   - Privacy consideration: User control
   - Priority: High (for privacy)

7. **Looking For** (What kind of opportunities/collaborations)
   - Type: Multi-checkbox
   - Options: Co-founders, Internship, Contract work, Full-time, Mentorship, Collaborators
   - Used for: Opportunity matching
   - Priority: Medium

8. **Timezone/Region**
   - Type: Timezone select or regional select
   - Used for: Scheduling, event filtering
   - Priority: Low

9. **Languages Spoken**
   - Type: Multi-select
   - Options: English, Hindi, Spanish, etc.
   - Used for: Community language filtering
   - Priority: Low

10. **Social Handles** (Twitter, Discord, etc.)
    - Type: URL/handle inputs
    - Used for: Social community linking
    - Priority: Low

---

## Validation Rules Currently Implemented

✅ **Name**: Required, non-empty
✅ **College**: Required, non-empty
✅ **Skills**: Required, minimum 1 skill must be added
✅ **URL fields** (GitHub, LinkedIn): URL format validation (in planning)
✅ **Bio**: 500 character limit
✅ **File upload**: PDF, DOC, DOCX only

---

## User Experience Flow

1. **Step 4 Opening**: Form scrolls to top, showing progress indicator "Step 4 of 4"
2. **Completion Checklist**: Live checklist shows what's required vs. optional
3. **Scrollable Form**: Form is scrollable with sticky header and footer buttons
4. **Sticky Footer**: Back and Submit buttons remain visible while scrolling
5. **Visual Sections**: Each section has its own card with distinct styling
6. **Inline Add UI**: Skills and Interests have inline add buttons (no modal)
7. **Tag Display**: Added skills/interests show as removable tags
8. **Real-time Validation**: Button disabled until minimum requirements met

---

## Recommendations for Future Enhancements

### High Priority
- [ ] Add "Years of Experience" selector
- [ ] Add "Looking For" opportunities multi-select
- [ ] URL validation for GitHub/LinkedIn links
- [ ] Profile preview before submission

### Medium Priority
- [ ] Portfolio URL field
- [ ] Preferred tech stack checkboxes
- [ ] Location/Timezone field
- [ ] CV file preview before upload

### Low Priority
- [ ] Social handles (Twitter, Discord)
- [ ] Languages spoken
- [ ] Availability status toggle
- [ ] Phone visibility settings

---

## Data Storage Strategy

**Local Storage (Development)**:
- All user profile data stored in localStorage
- Ready for migration to AWS Cognito

**AWS Cognito Integration (Production)**:
- User attributes stored in Cognito custom attributes
- CV files uploaded to S3
- Profile verified through Cognito pre-signin hooks

**User Object Structure** (after signup):
```typescript
{
  id: string;
  name: string;
  email: string;
  role: string;
  college: string;
  bio: string;
  avatar: string;
  skills: string[];
  interests: string[];
  githubUrl: string;
  linkedinUrl: string;
  reputation: number;
  hasOnboarded: boolean;
  cvUrl?: string;
}
```

