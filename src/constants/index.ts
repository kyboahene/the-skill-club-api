export const AGREED_CONSTANT = 3;
export const MEMBER_UPLOAD = 'member';
export const CSV_UPLOAD_QUEUE = 'csv-upload';
export const DEFAULT_PASSWORD = 'simple@pass';
export const WITHDRAWAL_UPLOAD = 'withdrawal';
export const TRANSACTION_UPLOAD = 'transaction';
export const CONTRIBUTION_UPLOAD = 'contribution';
export const LOAN_BALANCE_UPLOAD = 'loan-balance';
export const LOAN_DEDUCTION_UPLOAD = 'loan-deduction';
export const NOTIFICATION_QUEUE = 'send-notification';
export const CALCULATE_INTEREST = 'calculate-interest';
export const OPENING_BALANCE_UPLOAD = 'opening-balance';

export enum CustomGender {
    Male = 'MALE',
    Female = 'FEMALE',
}

export const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];

export const RepaymentPeriod = {
    ONE: 1,
    TWO: 2,
    THREE: 3,
    FOUR: 4
  };

  export const systemRoles = [
    // Platform roles (global)
    {
      name: 'super_admin',
      description: 'Super administrator with full platform access',
      context: "PLATFORM",
      contextId: null,
      isSystem: true,
      permissions: ['*'] // Special case - will get all permissions
    },
    {
      name: 'platform_admin',
      description: 'Platform administrator',
      context: "PLATFORM",
      contextId: null,
      isSystem: true,
      permissions: [
        '148f0a0c-1fb6-4fab-9c4d-6a9dc21a6675', // get_permissions
        '47c3fb10-de84-4adb-b862-38df3374b1c9', // get_permission
        'c6a01edd-f0f3-4ef0-8ac2-b383b3a33eb0', // get_roles
        '77e961c4-fe44-4159-99a4-cf35de025145', // get_role
        'd07e771d-4d2e-4b7c-8fef-c7c656f83b17', // add_role
        '8c7031a5-2a94-4ee1-86d5-706c415287d9', // update_role
        '563372f9-5c22-4908-8088-a78817af8adf'  // delete_role
      ]
    },

    // Talent role templates
    {
      name: 'verified_talent',
      description: 'Verified talent profile',
      context: "TALENT",
      contextId: null,
      isSystem: true,
      permissions: [
        '2b8f3c1d-4e5f-6789-abcd-1234567890ef', // get_talents
        '4d0f5e3f-6071-89ab-cdef-34567890fabc', // get_talent
        '6f2f7051-8293-abcd-ef01-567890fabcde', // get_talent_profile
        '8142927b-a415-cdef-0123-7890fabcdef0', // update_talent_profile
        'e7a858d1-0a6b-2345-6789-bcdef0123456', // get_jobs
        '09ca7af3-2c8d-4567-89ab-def012345678', // get_job
        '2bec9c15-4eaf-6789-abcd-f01234567890', // get_job_applications
        'a36417bd-c627-ef01-2345-678901234568', // get_events
        'c58639df-e849-0123-4567-89012345678a', // get_event
        '4d0eb157-60c1-89ab-cdef-678abcdef012', // get_companies
        '6f20d379-82e3-abcd-ef01-89abcdef1234', // get_company
        'b2c3d4e5-f6a7-5890-b123-c4d5e6f7a890', // get_tests
        'b2c3d4e5-f6a7-5890-b123-c4d5e6f7a892', // get_test
        'b2c3d4e5-f6a7-5890-b123-c4d5e6f7a894'  // get_tests_by_company
      ]
    },

    // Company role templates (will be instantiated per company)
    {
      name: 'company_admin',
      description: 'Company administrator template',
      context: "COMPANY",
      contextId: null, // Template - no specific company
      isSystem: true,
      permissions: [
        // Job management permissions
        'e7a858d1-0a6b-2345-6789-bcdef0123456', // get_jobs
        '09ca7af3-2c8d-4567-89ab-def012345678', // get_job
        '4d0eb137-60c1-89ab-cdef-123456789012', // add_job
        '6f20d359-82e3-abcd-ef01-345678901234', // update_job
        '8142f57b-a405-cdef-0123-567890123456', // delete_job
        '2bec9c15-4eaf-6789-abcd-f01234567890', // get_job_applications
        
        // Company management permissions
        '4d0eb157-60c1-89ab-cdef-678abcdef012', // get_companies
        '6f20d379-82e3-abcd-ef01-89abcdef1234', // get_company
        'b47528ce-d738-f012-3456-ef12345678ab', // add_company
        '2bec9f36-4eaf-6789-abcd-56789bcdef01', // update_company
        '8142f59b-a405-cdef-0123-abcdef123456', // get_company_users
        '09ca7d14-2c8d-4567-89ab-3456789bcdef', // add_company_user
        'c58639df-e849-0123-4567-789bcdef0123', // update_company_user
        '6f20d379-82e3-abcd-ef01-9bcdef012345', // delete_company_user
        
        // Test management permissions
        'b2c3d4e5-f6a7-5890-b123-c4d5e6f7a890', // get_tests
        'b2c3d4e5-f6a7-5890-b123-c4d5e6f7a892', // get_test
        'b2c3d4e5-f6a7-5890-b123-c4d5e6f7a894', // get_tests_by_company
        'b2c3d4e5-f6a7-5890-b123-c4d5e6f7a896', // get_tests_by_ids
        'b2c3d4e5-f6a7-5890-b123-c4d5e6f7a898', // add_test
        'b2c3d4e5-f6a7-5890-b123-c4d5e6f7a900', // update_test
        'b2c3d4e5-f6a7-5890-b123-c4d5e6f7a902', // delete_test
        
        // Skills management permissions
        'c3d4e5f6-a7b8-6901-c234-d5e6f7a8b901', // get_skills
        'c3d4e5f6-a7b8-6901-c234-d5e6f7a8b903', // get_skill
        'c3d4e5f6-a7b8-6901-c234-d5e6f7a8b905', // add_skill
        'c3d4e5f6-a7b8-6901-c234-d5e6f7a8b907', // update_skill
        'c3d4e5f6-a7b8-6901-c234-d5e6f7a8b909', // delete_skill
        
        // Company Assessment permissions
        'a1b2c3d4-e5f6-4789-a012-b3c4d5e6f799', // add_company_assessment
        'e5f6a7b8-c9d0-8123-e456-f7a8b9c0d123', // get_company_assessments
        'e5f6a7b8-c9d0-8123-e456-f7a8b9c0d125', // get_company_assessment
        'e5f6a7b8-c9d0-8123-e456-f7a8b9c0d127', // get_company_assessment_invitations
        'e5f6a7b8-c9d0-8123-e456-f7a8b9c0d129', // get_company_assessment_invitation
        'e5f6a7b8-c9d0-8123-e456-f7a8b9c0d131', // update_company_assessment_invitation
        'e5f6a7b8-c9d0-8123-e456-f7a8b9c0d133', // resend_company_assessment_invitation
        'e5f6a7b8-c9d0-8123-e456-f7a8b9c0d135', // delete_company_assessment_invitation
        'e5f6a7b8-c9d0-8123-e456-f7a8b9c0d137', // create_company_assessment_invitations
        'e5f6a7b8-c9d0-8123-e456-f7a8b9c0d139', // get_company_candidate_sessions
        
        // User management permissions
        'd4e5f6a7-b8c9-7012-d345-e6f7a8b9c012', // add_user
        'd4e5f6a7-b8c9-7012-d345-e6f7a8b9c013'  // get_user
      ]
    },
    {
      name: 'recruiter',
      description: 'Recruiter role template',
      context: "COMPANY",
      contextId: null,
      isSystem: true,
      permissions: [
        'e7a858d1-0a6b-2345-6789-bcdef0123456', // get_jobs
        '09ca7af3-2c8d-4567-89ab-def012345678', // get_job
        '4d0eb137-60c1-89ab-cdef-123456789012', // add_job
        '6f20d359-82e3-abcd-ef01-345678901234', // update_job
        '2b8f3c1d-4e5f-6789-abcd-1234567890ef', // get_talents
        '4d0f5e3f-6071-89ab-cdef-34567890fabc'  // get_talent
      ]
    },
    {
      name: 'hr_manager',
      description: 'HR Manager template',
      context: "COMPANY",
      contextId: null,
      isSystem: true,
      permissions: [
        '2b8f3c1d-4e5f-6789-abcd-1234567890ef', // get_talents
        '4d0f5e3f-6071-89ab-cdef-34567890fabc', // get_talent
        '4d0eb157-60c1-89ab-cdef-678abcdef012', // get_companies
        '6f20d379-82e3-abcd-ef01-89abcdef1234'  // get_company
      ]
    }
  ];