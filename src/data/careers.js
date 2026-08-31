// Static fallback — shown when Supabase isn't configured, or the
// career_roles table isn't set up yet. Kept in sync with the rows the
// admin "Careers" section seeds on first setup.
export const careerRoles = [
  {
    id: 'senior-3d-designer',
    title: 'Senior 3D Designer',
    type: 'Freelance Consultant',
    summary: 'Lead complex modeling and sculpting work across figurines, bobbleheads, idols, and custom commissions.',
    description:
      'We\'re looking for an experienced 3D designer to take on our more intricate modeling and sculpting briefs — likenesses from reference photos, detailed figurines, and custom character work. You\'ll work directly with the ORIC team on a project basis, turning customer references and specs into print-ready models.',
    responsibilities: [
      'Sculpt and model custom figurines, bobbleheads, and idols from photo references',
      'Prepare and optimize models for FDM printing (wall thickness, supports, orientation)',
      'Collaborate with the team on scoping and timelines for incoming commissions',
      'Maintain a consistent quality and style bar across delivered work',
    ],
    requirements: [
      '3+ years of experience in 3D modeling/sculpting (ZBrush, Blender, or similar)',
      'A portfolio showing character or likeness-based work',
      'Comfortable preparing models specifically for FDM 3D printing',
      'Based in or able to work India hours; freelance/project-based availability',
    ],
    active: true,
    sort_order: 0,
  },
  {
    id: 'marketing-and-sales',
    title: 'Marketing and Sales',
    type: 'Freelance Consultant',
    summary: 'Grow ORIC\'s customer base and manage outreach across digital channels and direct sales.',
    description:
      'We\'re looking for a marketing and sales consultant to help grow ORIC\'s reach — from social media and content to direct outreach for bulk/corporate orders (gifting, events, manufacturing batches). You\'ll work closely with the founder on campaigns, partnerships, and lead generation.',
    responsibilities: [
      'Plan and run social media / digital marketing campaigns',
      'Identify and pursue corporate gifting and bulk order opportunities',
      'Build partnerships with event planners, gifting platforms, and resellers',
      'Track and report on campaign performance and lead conversion',
    ],
    requirements: [
      'Experience in digital marketing, sales, or business development',
      'Comfortable owning outreach end-to-end — from first contact to close',
      'Prior experience with a D2C, gifting, or e-commerce brand is a plus',
      'Freelance/project-based availability',
    ],
    active: true,
    sort_order: 1,
  },
  {
    id: '3d-print-design-specialist',
    title: '3D Print Design Specialist',
    type: 'Freelance Consultant',
    summary: 'Prepare, slice, and troubleshoot print files across our FDM material and shape range.',
    description:
      'We\'re looking for someone who lives in the details of getting a model from file to finished print — slicer settings, material selection, supports, and print troubleshooting across PLA, PETG, TPU, ABS, and ASA. You\'ll work on incoming custom print requests, prototypes, and small-batch manufacturing runs.',
    responsibilities: [
      'Prepare and slice customer-submitted STL/STEP/OBJ files for print',
      'Recommend material, infill, and quality settings per job',
      'Troubleshoot print failures and iterate on settings for tricky geometries',
      'Support small-batch manufacturing runs with consistent, repeatable setups',
    ],
    requirements: [
      'Hands-on experience with FDM printing and slicing software (Cura, PrusaSlicer, or similar)',
      'Working knowledge of PLA, PETG, TPU, ABS, and ASA behavior and settings',
      'Comfortable troubleshooting prints independently',
      'Freelance/project-based availability',
    ],
    active: true,
    sort_order: 2,
  },
]
