/**
 * Hand-written starting point matching supabase/migrations/0001_schema.sql.
 * Once your Supabase project is live and migrations are applied, regenerate
 * the authoritative version with:
 *   npm run supabase:types
 * (update the project-id in package.json's script first).
 */

export type UserRole = "student" | "club_member" | "super_admin";
export type ApplicationStatus = "pending" | "approved" | "rejected";
export type ModuleLevel = "beginner" | "intermediate" | "advanced";
export type ProgressStatus = "not_started" | "in_progress" | "completed";
export type ProjectStatus = "draft" | "pending_review" | "approved" | "rejected";
export type EventType = "workshop" | "meeting" | "competition" | "public";
export type VisibilityLevel = "public" | "student" | "club_member";
export type ResourceType = "pdf" | "code" | "diagram" | "image" | "ebook" | "link";
export type NotificationType =
  | "membership_status"
  | "project_status"
  | "new_reply"
  | "new_message"
  | "badge_earned"
  | "announcement"
  | "event_reminder";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          avatar_url: string | null;
          bio: string | null;
          role: UserRole;
          year_group: string | null;
          class_track: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & { id: string };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: never[];
      };
      membership_applications: {
        Row: {
          id: string;
          user_id: string;
          status: ApplicationStatus;
          motivation_text: string;
          reviewed_by: string | null;
          reviewed_at: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["membership_applications"]["Row"]> & {
          user_id: string;
          motivation_text: string;
        };
        Update: Partial<Database["public"]["Tables"]["membership_applications"]["Row"]>;
        Relationships: never[];
      };
      modules: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description: string | null;
          level: ModuleLevel;
          order_index: number;
          cover_image_url: string | null;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["modules"]["Row"]> & {
          title: string;
          slug: string;
        };
        Update: Partial<Database["public"]["Tables"]["modules"]["Row"]>;
        Relationships: never[];
      };
      lessons: {
        Row: {
          id: string;
          module_id: string;
          title: string;
          slug: string;
          order_index: number;
          objectives: string[];
          materials: string[];
          content_body: unknown;
          code_snippets: unknown;
          estimated_minutes: number | null;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["lessons"]["Row"]> & {
          module_id: string;
          title: string;
          slug: string;
        };
        Update: Partial<Database["public"]["Tables"]["lessons"]["Row"]>;
        Relationships: never[];
      };
      quizzes: {
        Row: {
          id: string;
          lesson_id: string | null;
          title: string;
          passing_score: number;
          questions: unknown;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["quizzes"]["Row"]> & { title: string };
        Update: Partial<Database["public"]["Tables"]["quizzes"]["Row"]>;
        Relationships: never[];
      };
      quiz_attempts: {
        Row: {
          id: string;
          quiz_id: string;
          user_id: string;
          score: number;
          passed: boolean;
          answers: unknown;
          attempted_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["quiz_attempts"]["Row"]> & {
          quiz_id: string;
          user_id: string;
          score: number;
          passed: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["quiz_attempts"]["Row"]>;
        Relationships: never[];
      };
      lesson_progress: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: string;
          status: ProgressStatus;
          completed_at: string | null;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["lesson_progress"]["Row"]> & {
          user_id: string;
          lesson_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["lesson_progress"]["Row"]>;
        Relationships: never[];
      };
      streaks: {
        Row: {
          user_id: string;
          current_streak: number;
          longest_streak: number;
          last_active_date: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["streaks"]["Row"]> & { user_id: string };
        Update: Partial<Database["public"]["Tables"]["streaks"]["Row"]>;
        Relationships: never[];
      };
      achievements: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          icon_url: string | null;
          criteria_type: "streak" | "module_complete" | "quiz_score" | "project_submitted" | "custom";
          criteria_value: number | null;
        };
        Insert: Partial<Database["public"]["Tables"]["achievements"]["Row"]> & { title: string };
        Update: Partial<Database["public"]["Tables"]["achievements"]["Row"]>;
        Relationships: never[];
      };
      user_achievements: {
        Row: {
          id: string;
          user_id: string;
          achievement_id: string;
          earned_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["user_achievements"]["Row"]> & {
          user_id: string;
          achievement_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["user_achievements"]["Row"]>;
        Relationships: never[];
      };
      projects: {
        Row: {
          id: string;
          title: string;
          slug: string;
          cover_image_url: string | null;
          summary: string | null;
          problem_statement: string | null;
          materials: string[];
          circuit_diagram_url: string | null;
          code_repo_url: string | null;
          demo_video_url: string | null;
          build_steps: unknown;
          status: ProjectStatus;
          submitted_by: string | null;
          reviewed_by: string | null;
          is_club_project: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["projects"]["Row"]> & {
          title: string;
          slug: string;
        };
        Update: Partial<Database["public"]["Tables"]["projects"]["Row"]>;
        Relationships: never[];
      };
      project_team_members: {
        Row: { id: string; project_id: string; user_id: string; role_label: string | null };
        Insert: Partial<Database["public"]["Tables"]["project_team_members"]["Row"]> & {
          project_id: string;
          user_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["project_team_members"]["Row"]>;
        Relationships: never[];
      };
      project_images: {
        Row: {
          id: string;
          project_id: string;
          image_url: string;
          caption: string | null;
          order_index: number;
        };
        Insert: Partial<Database["public"]["Tables"]["project_images"]["Row"]> & {
          project_id: string;
          image_url: string;
        };
        Update: Partial<Database["public"]["Tables"]["project_images"]["Row"]>;
        Relationships: never[];
      };
      project_comments: {
        Row: { id: string; project_id: string; user_id: string; body: string; created_at: string };
        Insert: Partial<Database["public"]["Tables"]["project_comments"]["Row"]> & {
          project_id: string;
          user_id: string;
          body: string;
        };
        Update: Partial<Database["public"]["Tables"]["project_comments"]["Row"]>;
        Relationships: never[];
      };
      events: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description: string | null;
          event_type: EventType;
          starts_at: string;
          ends_at: string | null;
          location: string | null;
          cover_image_url: string | null;
          is_internal: boolean;
          registration_required: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["events"]["Row"]> & {
          title: string;
          slug: string;
          starts_at: string;
        };
        Update: Partial<Database["public"]["Tables"]["events"]["Row"]>;
        Relationships: never[];
      };
      event_registrations: {
        Row: {
          id: string;
          event_id: string;
          user_id: string;
          registered_at: string;
          status: "registered" | "cancelled" | "attended";
        };
        Insert: Partial<Database["public"]["Tables"]["event_registrations"]["Row"]> & {
          event_id: string;
          user_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["event_registrations"]["Row"]>;
        Relationships: never[];
      };
      resources: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          file_url: string;
          resource_type: ResourceType;
          visibility: VisibilityLevel;
          uploaded_by: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["resources"]["Row"]> & {
          title: string;
          file_url: string;
          resource_type: ResourceType;
        };
        Update: Partial<Database["public"]["Tables"]["resources"]["Row"]>;
        Relationships: never[];
      };
      community_posts: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          body: string;
          is_pinned: boolean;
          is_resolved: boolean;
          upvote_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["community_posts"]["Row"]> & {
          user_id: string;
          title: string;
          body: string;
        };
        Update: Partial<Database["public"]["Tables"]["community_posts"]["Row"]>;
        Relationships: never[];
      };
      community_replies: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          body: string;
          is_accepted_answer: boolean;
          upvote_count: number;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["community_replies"]["Row"]> & {
          post_id: string;
          user_id: string;
          body: string;
        };
        Update: Partial<Database["public"]["Tables"]["community_replies"]["Row"]>;
        Relationships: never[];
      };
      community_upvotes: {
        Row: {
          id: string;
          user_id: string;
          target_type: "post" | "reply";
          target_id: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["community_upvotes"]["Row"]> & {
          user_id: string;
          target_type: "post" | "reply";
          target_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["community_upvotes"]["Row"]>;
        Relationships: never[];
      };
      conversations: {
        Row: {
          id: string;
          is_group: boolean;
          is_team_chat: boolean;
          project_id: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["conversations"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["conversations"]["Row"]>;
        Relationships: never[];
      };
      conversation_participants: {
        Row: { conversation_id: string; user_id: string; joined_at: string };
        Insert: Partial<Database["public"]["Tables"]["conversation_participants"]["Row"]> & {
          conversation_id: string;
          user_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["conversation_participants"]["Row"]>;
        Relationships: never[];
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          body: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["messages"]["Row"]> & {
          conversation_id: string;
          sender_id: string;
          body: string;
        };
        Update: Partial<Database["public"]["Tables"]["messages"]["Row"]>;
        Relationships: never[];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: NotificationType;
          title: string;
          body: string | null;
          link_url: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["notifications"]["Row"]> & {
          user_id: string;
          type: NotificationType;
          title: string;
        };
        Update: Partial<Database["public"]["Tables"]["notifications"]["Row"]>;
        Relationships: never[];
      };
      announcements: {
        Row: {
          id: string;
          title: string;
          body: string;
          visibility: VisibilityLevel;
          published_at: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["announcements"]["Row"]> & {
          title: string;
          body: string;
        };
        Update: Partial<Database["public"]["Tables"]["announcements"]["Row"]>;
        Relationships: never[];
      };
      gallery_items: {
        Row: {
          id: string;
          image_url: string;
          caption: string | null;
          category: string | null;
          uploaded_by: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["gallery_items"]["Row"]> & { image_url: string };
        Update: Partial<Database["public"]["Tables"]["gallery_items"]["Row"]>;
        Relationships: never[];
      };
      app_settings: {
        Row: {
          key: string;
          value: unknown;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["app_settings"]["Row"]> & {
          key: string;
          value: unknown;
        };
        Update: Partial<Database["public"]["Tables"]["app_settings"]["Row"]>;
        Relationships: never[];
      };
      contact_messages: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          message: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["contact_messages"]["Row"]> & {
          full_name: string;
          email: string;
          message: string;
        };
        Update: Partial<Database["public"]["Tables"]["contact_messages"]["Row"]>;
        Relationships: never[];
      };
      moderation_actions: {
        Row: {
          id: string;
          admin_id: string;
          action_type:
            | "remove_post"
            | "remove_reply"
            | "reject_project"
            | "reject_membership"
            | "ban_user";
          target_type: string;
          target_id: string;
          reason: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["moderation_actions"]["Row"]> & {
          admin_id: string;
          action_type:
            | "remove_post"
            | "remove_reply"
            | "reject_project"
            | "reject_membership"
            | "ban_user";
          target_type: string;
          target_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["moderation_actions"]["Row"]>;
        Relationships: never[];
      };
      quiz_answers: {
        Row: {
          quiz_id: string;
          question_index: number;
          correct_index: number;
          explanation: string | null;
        };
        Insert: Database["public"]["Tables"]["quiz_answers"]["Row"];
        Update: Partial<Database["public"]["Tables"]["quiz_answers"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "quiz_answers_quiz_id_fkey";
            columns: ["quiz_id"];
            referencedRelation: "quizzes";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      can_message: {
        Args: { user_a: string; user_b: string };
        Returns: boolean;
      };
      get_site_setting: {
        Args: { setting_key: string };
        Returns: any;
      };
    };
  };
}
