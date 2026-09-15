const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const prisma = require('../prisma/client');

const R2_PUBLIC_DOMAIN = (
  process.env.R2_PUBLIC_DOMAIN ||
  'https://pub-2839c05f69c040768d61d9a74a3f536b.r2.dev'
)
  .trim()
  .replace(/\/+$/, '');

const newCouncil = [
  {
    name: 'Mustafa Avais',
    role: 'President',
    tenure: '26-27',
    displayOrder: 1,
    image: `${R2_PUBLIC_DOMAIN}/members/mustafa-avais-president-26-27.jpeg`,
    isCurrent: true,
  },
  {
    name: 'Yawar Kamal',
    role: 'Vice President',
    tenure: '26-27',
    displayOrder: 2,
    image: `${R2_PUBLIC_DOMAIN}/members/yawar-kamal-vice-president-26-27.jpeg`,
    isCurrent: true,
  },
  {
    name: 'Muaz Nadeem',
    role: 'Program Manager',
    tenure: '26-27',
    displayOrder: 3,
    image: `${R2_PUBLIC_DOMAIN}/members/muaz-nadeem-program-manager-26-27.jpeg`,
    isCurrent: true,
  },
  {
    name: 'Abdur Rafay',
    role: 'Dev Director',
    tenure: '26-27',
    displayOrder: 4,
    image: `${R2_PUBLIC_DOMAIN}/members/abdur-rafay-dev-director-26-27.jpeg`,
    isCurrent: true,
  },
  {
    name: 'Hassnain Abbas',
    role: 'EC Member',
    tenure: '26-27',
    displayOrder: 5,
    image: `${R2_PUBLIC_DOMAIN}/members/hassnain-abbas-ec-member-26-27.jpeg`,
    isCurrent: true,
  },
  {
    name: 'Hiba Zulfiqar',
    role: 'EC Member',
    tenure: '26-27',
    displayOrder: 6,
    image: `${R2_PUBLIC_DOMAIN}/members/hiba-zulfiqar-ec-member-26-27.jpeg`,
    isCurrent: true,
  },
  {
    name: 'Muhammad Bilal',
    role: 'EC Member',
    tenure: '26-27',
    displayOrder: 7,
    image: `${R2_PUBLIC_DOMAIN}/members/muhammad-bilal-ec-member-26-27.jpeg`,
    isCurrent: true,
  },
  {
    name: 'Rabbin Batool',
    role: 'EC Member',
    tenure: '26-27',
    displayOrder: 8,
    image: `${R2_PUBLIC_DOMAIN}/members/rabbin-batool-ec-member-26-27.jpeg`,
    isCurrent: true,
  },
  {
    name: 'Riyan Javed',
    role: 'EC Member',
    tenure: '26-27',
    displayOrder: 9,
    image: `${R2_PUBLIC_DOMAIN}/members/riyan-javed-ec-member-26-27.jpeg`,
    isCurrent: true,
  },
];

async function main() {
  console.log('Syncing new Executive Council (26-27) members to DB...\n');

  for (const m of newCouncil) {
    const existing = await prisma.member.findFirst({
      where: {
        name: { equals: m.name, mode: 'insensitive' },
        tenure: m.tenure,
      },
    });

    if (existing) {
      const updated = await prisma.member.update({
        where: { id: existing.id },
        data: {
          role: m.role,
          image: m.image,
          displayOrder: m.displayOrder,
          isCurrent: true,
        },
      });
      console.log(`[UPDATED] #${updated.id} ${updated.name} (${updated.role})`);
    } else {
      const created = await prisma.member.create({
        data: m,
      });
      console.log(`[CREATED] #${created.id} ${created.name} (${created.role})`);
    }
  }

  console.log('\n✓ Council members synced successfully!');
}

main()
  .catch((e) => {
    console.error('Error syncing council members:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
