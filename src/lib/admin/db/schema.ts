/**
 * Full normalized schema for the content store — one table per section, with a
 * child table for every nested list. All identifiers are backticked (several
 * column names — `read`, `date`, `time`, `year`, `value`, `role`, `position` —
 * are MySQL reserved words). Child tables cascade-delete with their parent.
 *
 * `sections` is a marker table reproducing the old blob store's row-existence
 * semantics: a section is "initialized" once it has been written at least once.
 * Until then reads return undefined so the app falls back to its in-code
 * defaults (src/data/*), exactly as before this migration.
 */

const OPTS = "ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

// A child table keyed to a collection parent (whose PK is `slug`), cascading
// on delete. `fkCol` is the child's FK column (e.g. condition_slug); it always
// references the parent's `slug` column.
const childOf = (
  table: string,
  parent: string,
  fkCol: string,
  cols: string,
) => `CREATE TABLE IF NOT EXISTS \`${table}\` (
  \`id\` INT NOT NULL AUTO_INCREMENT,
  \`${fkCol}\` VARCHAR(191) NOT NULL,
  \`position\` INT NOT NULL DEFAULT 0,
  ${cols},
  PRIMARY KEY (\`id\`),
  KEY \`k_${table}\` (\`${fkCol}\`),
  CONSTRAINT \`fk_${table}\` FOREIGN KEY (\`${fkCol}\`)
    REFERENCES \`${parent}\` (\`slug\`) ON DELETE CASCADE
) ${OPTS}`;

// A child table belonging to a single-row singleton (no FK; replaced wholesale).
const singletonChild = (table: string, cols: string) =>
  `CREATE TABLE IF NOT EXISTS \`${table}\` (
  \`id\` INT NOT NULL AUTO_INCREMENT,
  \`position\` INT NOT NULL DEFAULT 0,
  ${cols},
  PRIMARY KEY (\`id\`)
) ${OPTS}`;

export const DDL: string[] = [
  // -------- marker --------
  `CREATE TABLE IF NOT EXISTS \`sections\` (
    \`name\` VARCHAR(64) NOT NULL PRIMARY KEY,
    \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ${OPTS}`,

  // -------- conditions --------
  `CREATE TABLE IF NOT EXISTS \`conditions\` (
    \`slug\` VARCHAR(191) NOT NULL PRIMARY KEY,
    \`name\` TEXT NOT NULL,
    \`category\` VARCHAR(32) NOT NULL,
    \`featured\` TINYINT NOT NULL DEFAULT 0,
    \`summary\` TEXT,
    \`intro\` MEDIUMTEXT,
    \`hero_image\` VARCHAR(255) NULL,
    \`intro_image\` VARCHAR(255) NULL,
    \`position\` INT NOT NULL DEFAULT 0
  ) ${OPTS}`,
  childOf("condition_symptoms", "conditions", "condition_slug", "`text` TEXT"),
  childOf("condition_causes", "conditions", "condition_slug", "`text` TEXT"),
  childOf("condition_treatment", "conditions", "condition_slug", "`text` TEXT"),
  childOf(
    "condition_expected_results",
    "conditions",
    "condition_slug",
    "`phase` TEXT, `detail` TEXT",
  ),
  childOf(
    "condition_faqs",
    "conditions",
    "condition_slug",
    "`question` TEXT, `answer` TEXT",
  ),
  childOf(
    "condition_results",
    "conditions",
    "condition_slug",
    "`before_image` VARCHAR(255), `after_image` VARCHAR(255), `label` TEXT, `note` TEXT",
  ),

  // -------- products --------
  `CREATE TABLE IF NOT EXISTS \`products\` (
    \`slug\` VARCHAR(191) NOT NULL PRIMARY KEY,
    \`name\` TEXT NOT NULL,
    \`category\` VARCHAR(32) NOT NULL,
    \`image\` VARCHAR(255) NULL,
    \`tagline\` TEXT,
    \`description\` MEDIUMTEXT,
    \`price\` INT NOT NULL DEFAULT 0,
    \`compare_at_price\` INT NULL,
    \`size\` VARCHAR(191),
    \`in_stock\` TINYINT NOT NULL DEFAULT 1,
    \`featured\` TINYINT NOT NULL DEFAULT 0,
    \`bestseller\` TINYINT NOT NULL DEFAULT 0,
    \`caution\` TEXT,
    \`rating_value\` FLOAT NOT NULL DEFAULT 0,
    \`rating_count\` INT NOT NULL DEFAULT 0,
    \`position\` INT NOT NULL DEFAULT 0
  ) ${OPTS}`,
  childOf("product_benefits", "products", "product_slug", "`text` TEXT"),
  childOf("product_directions", "products", "product_slug", "`text` TEXT"),
  childOf(
    "product_related",
    "products",
    "product_slug",
    "`related_slug` VARCHAR(191)",
  ),
  childOf(
    "product_ingredients",
    "products",
    "product_slug",
    "`name` TEXT, `role` TEXT",
  ),
  childOf(
    "product_reviews",
    "products",
    "product_slug",
    "`author` TEXT, `location` TEXT, `rating` INT, `date` VARCHAR(32), `title` TEXT, `body` TEXT",
  ),

  // -------- posts --------
  `CREATE TABLE IF NOT EXISTS \`posts\` (
    \`slug\` VARCHAR(191) NOT NULL PRIMARY KEY,
    \`title\` TEXT NOT NULL,
    \`category\` VARCHAR(32) NOT NULL,
    \`image\` VARCHAR(255) NULL,
    \`excerpt\` TEXT,
    \`published_at\` VARCHAR(32),
    \`reading_minutes\` INT NOT NULL DEFAULT 0,
    \`featured\` TINYINT NOT NULL DEFAULT 0,
    \`position\` INT NOT NULL DEFAULT 0
  ) ${OPTS}`,
  `CREATE TABLE IF NOT EXISTS \`post_blocks\` (
    \`id\` INT NOT NULL AUTO_INCREMENT,
    \`post_slug\` VARCHAR(191) NOT NULL,
    \`position\` INT NOT NULL DEFAULT 0,
    \`type\` VARCHAR(16) NOT NULL,
    \`text\` MEDIUMTEXT NULL,
    PRIMARY KEY (\`id\`),
    KEY \`k_post_blocks\` (\`post_slug\`),
    CONSTRAINT \`fk_post_blocks\` FOREIGN KEY (\`post_slug\`)
      REFERENCES \`posts\` (\`slug\`) ON DELETE CASCADE
  ) ${OPTS}`,
  `CREATE TABLE IF NOT EXISTS \`post_block_items\` (
    \`id\` INT NOT NULL AUTO_INCREMENT,
    \`block_id\` INT NOT NULL,
    \`position\` INT NOT NULL DEFAULT 0,
    \`text\` TEXT,
    PRIMARY KEY (\`id\`),
    KEY \`k_post_block_items\` (\`block_id\`),
    CONSTRAINT \`fk_post_block_items\` FOREIGN KEY (\`block_id\`)
      REFERENCES \`post_blocks\` (\`id\`) ON DELETE CASCADE
  ) ${OPTS}`,

  // -------- testimonials (flat collection) --------
  // Identity is inconsistent across sources: seed records use `id` (t1, t2…),
  // admin-created ones use `slug`. Both are stored nullable and the row uses a
  // surrogate PK; the list is replaced wholesale on write (no child tables).
  `CREATE TABLE IF NOT EXISTS \`testimonials\` (
    \`id\` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    \`rec_id\` VARCHAR(191) NULL,
    \`slug\` VARCHAR(191) NULL,
    \`author\` TEXT,
    \`location\` TEXT,
    \`quote\` TEXT,
    \`context\` TEXT,
    \`consent_on_file\` TINYINT NOT NULL DEFAULT 0,
    \`position\` INT NOT NULL DEFAULT 0
  ) ${OPTS}`,

  // -------- homepage FAQs (list singleton) --------
  singletonChild("homepage_faqs", "`question` TEXT, `answer` TEXT"),

  // -------- doctor (nested singleton) --------
  `CREATE TABLE IF NOT EXISTS \`doctor\` (
    \`id\` INT NOT NULL PRIMARY KEY,
    \`bio_intro\` MEDIUMTEXT,
    \`mission\` TEXT,
    \`vision\` TEXT
  ) ${OPTS}`,
  singletonChild("doctor_bio_paragraphs", "`text` MEDIUMTEXT"),
  singletonChild("doctor_values", "`title` TEXT, `detail` TEXT"),
  singletonChild(
    "doctor_education",
    "`year` VARCHAR(16), `qualification` TEXT, `institution` TEXT, `detail` TEXT",
  ),
  singletonChild(
    "doctor_timeline",
    "`year` VARCHAR(16), `title` TEXT, `detail` TEXT",
  ),
  singletonChild("doctor_achievements", "`title` TEXT, `detail` TEXT"),
  singletonChild("doctor_gallery", "`slot` TEXT, `label` TEXT"),

  // -------- clinic (nested singleton) --------
  `CREATE TABLE IF NOT EXISTS \`clinic\` (
    \`id\` INT NOT NULL PRIMARY KEY,
    \`phone\` VARCHAR(32),
    \`whatsapp\` VARCHAR(32),
    \`email\` VARCHAR(191),
    \`address_line1\` TEXT,
    \`address_line2\` TEXT,
    \`city\` VARCHAR(191),
    \`district\` VARCHAR(191),
    \`state\` VARCHAR(191),
    \`postal_code\` VARCHAR(32),
    \`map_query\` TEXT
  ) ${OPTS}`,
  singletonChild("clinic_hours", "`days` VARCHAR(191), `time` VARCHAR(191)"),
  singletonChild(
    "clinic_stats",
    "`value` INT, `suffix` VARCHAR(16), `label` TEXT",
  ),

  // -------- consultation (nested singleton) --------
  `CREATE TABLE IF NOT EXISTS \`consultation\` (
    \`id\` INT NOT NULL PRIMARY KEY,
    \`delivery_note\` MEDIUMTEXT
  ) ${OPTS}`,
  singletonChild("consultation_prepare", "`title` TEXT, `detail` TEXT"),

  // -------- gallery (list singleton) --------
  singletonChild("gallery_items", "`image` VARCHAR(255), `label` TEXT"),

  // -------- appointments (inbox) --------
  `CREATE TABLE IF NOT EXISTS \`appointments\` (
    \`id\` VARCHAR(32) NOT NULL PRIMARY KEY,
    \`created_at\` VARCHAR(32),
    \`status\` VARCHAR(16),
    \`mode\` VARCHAR(16),
    \`concern\` VARCHAR(64),
    \`date\` VARCHAR(16),
    \`time\` VARCHAR(16),
    \`name\` TEXT,
    \`phone\` VARCHAR(32),
    \`email\` VARCHAR(191),
    \`age\` VARCHAR(16),
    \`gender\` VARCHAR(16),
    \`notes\` TEXT,
    \`position\` INT NOT NULL DEFAULT 0
  ) ${OPTS}`,
  `CREATE TABLE IF NOT EXISTS \`appointment_files\` (
    \`id\` INT NOT NULL AUTO_INCREMENT,
    \`appointment_id\` VARCHAR(32) NOT NULL,
    \`position\` INT NOT NULL DEFAULT 0,
    \`filename\` VARCHAR(255),
    PRIMARY KEY (\`id\`),
    KEY \`k_appointment_files\` (\`appointment_id\`),
    CONSTRAINT \`fk_appointment_files\` FOREIGN KEY (\`appointment_id\`)
      REFERENCES \`appointments\` (\`id\`) ON DELETE CASCADE
  ) ${OPTS}`,

  // -------- enquiries (inbox, flat) --------
  `CREATE TABLE IF NOT EXISTS \`enquiries\` (
    \`id\` VARCHAR(32) NOT NULL PRIMARY KEY,
    \`created_at\` VARCHAR(32),
    \`read\` TINYINT NOT NULL DEFAULT 0,
    \`name\` TEXT,
    \`phone\` VARCHAR(32),
    \`email\` VARCHAR(191),
    \`reason\` VARCHAR(64),
    \`message\` MEDIUMTEXT,
    \`position\` INT NOT NULL DEFAULT 0
  ) ${OPTS}`,
];
