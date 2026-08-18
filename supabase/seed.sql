-- =============================================================
-- Seed data — realistic placeholder content for local development.
-- Does not seed `profiles` since those rows are created automatically
-- via the handle_new_user() trigger when real auth users sign up.
-- Run: supabase db reset (applies migrations then this file)
-- =============================================================

-- ---------- MODULES ----------
insert into modules (title, slug, description, level, order_index, is_published) values
  ('Introduction to Robotics', 'intro-to-robotics', 'What robotics is, where it is used, and the mindset to build with.', 'beginner', 1, true),
  ('Parts & Components of a Robot', 'robot-components', 'Chassis, motors, sensors, controllers — the building blocks.', 'beginner', 2, true),
  ('Basic Electronics', 'basic-electronics', 'Circuits, voltage, current, resistors, and breadboarding.', 'beginner', 3, true),
  ('Arduino Basics', 'arduino-basics', 'Your first programs and circuits with an Arduino board.', 'beginner', 4, true),
  ('Sensors & Actuators', 'sensors-actuators', 'Reading the world and acting on it — ultrasonic, IR, servos, motors.', 'intermediate', 5, true),
  ('Programming for Robotics', 'programming-for-robotics', 'Control structures, functions, and state machines for robot behavior.', 'intermediate', 6, true),
  ('AI in Robotics', 'ai-in-robotics', 'Where machine learning fits into modern robotics projects.', 'advanced', 7, false),
  ('Competition Robotics', 'competition-robotics', 'Designing and building for robotics competitions.', 'advanced', 8, false),
  ('Safety in Robotics & Electronics', 'safety-in-robotics', 'Working safely with tools, power, and components.', 'beginner', 0, true);

-- ---------- LESSONS (a starter set under Arduino Basics) ----------
insert into lessons (module_id, title, slug, order_index, objectives, materials, content_body, estimated_minutes, is_published)
select
  m.id,
  'Setting Up Your Arduino IDE',
  'setup-arduino-ide',
  1,
  array['Install the Arduino IDE', 'Connect and recognize your board', 'Run your first sketch'],
  array['Arduino Uno (or compatible)', 'USB cable', 'Computer'],
  '[{"type":"text","content":"Placeholder lesson body — replace with real content in Phase 3/4."}]'::jsonb,
  20,
  true
from modules m where m.slug = 'arduino-basics';

insert into lessons (module_id, title, slug, order_index, objectives, materials, content_body, estimated_minutes, is_published)
select
  m.id,
  'Blinking Your First LED',
  'blink-led',
  2,
  array['Wire an LED with a resistor', 'Upload the Blink sketch', 'Understand digitalWrite()'],
  array['Arduino Uno', 'LED', '220ohm resistor', 'Breadboard', 'Jumper wires'],
  '[{"type":"text","content":"Placeholder lesson body — replace with real content in Phase 3/4."}]'::jsonb,
  25,
  true
from modules m where m.slug = 'arduino-basics';

-- ---------- QUIZZES ----------
insert into quizzes (lesson_id, title, passing_score, questions)
select
  l.id,
  'Blink LED Quiz',
  70,
  '[
    {
      "question": "Which Arduino function turns a pin on or off?",
      "options": ["analogRead()", "digitalWrite()", "pinMode()", "delay()"],
      "correct_index": 1,
      "explanation": "digitalWrite(pin, HIGH/LOW) sets a digital pin on or off."
    },
    {
      "question": "Why do you need a resistor with an LED?",
      "options": ["To make it brighter", "To limit current and protect the LED", "To change its color", "It is not needed"],
      "correct_index": 1,
      "explanation": "A resistor limits current flow so the LED does not burn out."
    },
    {
      "question": "What does pinMode(13, OUTPUT) do?",
      "options": ["Reads a sensor on pin 13", "Sets pin 13 to send voltage out", "Deletes pin 13", "Nothing"],
      "correct_index": 1,
      "explanation": "pinMode() configures whether a pin reads (INPUT) or sends (OUTPUT) voltage."
    }
  ]'::jsonb
from lessons l where l.slug = 'blink-led';

-- ---------- ACHIEVEMENTS ----------
insert into achievements (title, description, criteria_type, criteria_value) values
  ('First Steps', 'Complete your first lesson', 'module_complete', 1),
  ('7-Day Streak', 'Learn for 7 days in a row', 'streak', 7),
  ('30-Day Streak', 'Learn for 30 days in a row', 'streak', 30),
  ('Quiz Ace', 'Score 100% on any quiz', 'quiz_score', 100),
  ('Builder', 'Submit your first project', 'project_submitted', 1);

-- ---------- EVENTS ----------
insert into events (title, slug, description, event_type, starts_at, ends_at, location, is_internal, registration_required) values
  ('Robotics Club Weekly Meeting', 'weekly-meeting-1', 'Regular Thursday club meeting — project check-ins and planning.', 'meeting', now() + interval '3 days', now() + interval '3 days 1 hour', 'Science Block Lab 2', true, false),
  ('Intro to Arduino Workshop', 'arduino-workshop-1', 'Hands-on workshop for beginners — bring a laptop if you have one.', 'workshop', now() + interval '10 days', now() + interval '10 days 2 hours', 'Science Block Lab 1', false, true),
  ('Regional Robotics Competition', 'regional-competition-1', 'Tarkwa Senior High competes in the regional robotics challenge.', 'competition', now() + interval '45 days', now() + interval '45 days 8 hours', 'Regional STEM Center', false, false);

-- ---------- ANNOUNCEMENTS ----------
insert into announcements (title, body, visibility, published_at) values
  ('Welcome to the Robotic Hub', 'The platform is live! Start with the beginner learning path and say hello in the community.', 'public', now()),
  ('Club Applications Now Open', 'Students who have completed at least one module can now apply for club membership from their dashboard.', 'student', now());

-- ---------- GALLERY ----------
insert into gallery_items (image_url, caption, category) values
  ('https://placehold.co/800x600?text=Club+Workshop', 'Members during the electronics workshop', 'workshops'),
  ('https://placehold.co/800x600?text=Competition+Team', 'The team at last year''s regional competition', 'competitions');
