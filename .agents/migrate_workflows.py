import os
import shutil
import re

workflows_dir = "/home/nandha/Desktop/agent/.agents/workflows"
skills_dir = "/home/nandha/Desktop/agent/.agents/skills"

# Keep these in workflows/ so they remain root slash commands
keep = {"skill.md", "caveman.md"}

os.makedirs(skills_dir, exist_ok=True)

for filename in os.listdir(workflows_dir):
    if filename.endswith(".md") and filename not in keep:
        name = filename[:-3]
        
        # Create skill dir
        target_dir = os.path.join(skills_dir, name)
        os.makedirs(target_dir, exist_ok=True)
        
        # Move file to SKILL.md
        source_path = os.path.join(workflows_dir, filename)
        target_path = os.path.join(target_dir, "SKILL.md")
        
        # We will also inject frontmatter if it doesn't exist so it indexes perfectly
        with open(source_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        if not content.startswith('---'):
            description = name.replace('-', ' ').title()
            # Try to grab the first heading
            match = re.search(r'^#\s+(.+)$', content, re.MULTILINE)
            if match:
                description = match.group(1).strip()
                
            frontmatter = f"---\nname: {name}\ndescription: {description}\ncategory: general\n---\n\n"
            content = frontmatter + content
            
        with open(target_path, 'w', encoding='utf-8') as f:
            f.write(content)
            
        os.remove(source_path)
        print(f"Migrated {name} to {target_path}")

print("Done migrating.")
