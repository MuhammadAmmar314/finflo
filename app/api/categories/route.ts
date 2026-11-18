import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { defaultUser } from '@/lib/defaultData';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email') || defaultUser.email;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        expenseCategories: true,
        incomeCategories: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        expenseCategories: user?.expenseCategories ?? [],
        incomeCategories: user?.incomeCategories ?? [],
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = body.email || defaultUser.email;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { expenseCategories: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Bulk creation (e.g., applying the recommended 6 pillars)
    if (Array.isArray(body.categories)) {
      const categoriesToCreate = body.categories;

      // Replace existing or append
      if (body.replaceExisting) {
        await prisma.expenseCategory.deleteMany({
          where: { userId: user.id },
        });
      }

      await prisma.expenseCategory.createMany({
        data: categoriesToCreate.map((c: any) => ({
          name: c.name,
          budgetPercentage: Number(c.budgetPercentage) || 0,
          color: c.color || '#0ea5e9',
          icon: c.icon || null,
          userId: user.id,
        })),
      });

      const updatedCategories = await prisma.expenseCategory.findMany({
        where: { userId: user.id },
      });

      return NextResponse.json({ success: true, data: updatedCategories }, { status: 201 });
    }

    const { name, budgetPercentage, color, icon } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Nama kategori wajib diisi.' },
        { status: 400 }
      );
    }

    if (user.plan !== 'pro' && user.expenseCategories.length >= 8) {
      return NextResponse.json(
        {
          success: false,
          error: 'Batas kuota Free Tier tercapai (maksimal 8 kategori).',
          code: 'FREE_TIER_LIMIT',
        },
        { status: 403 }
      );
    }

    const currentTotal = user.expenseCategories.reduce((sum, c) => sum + c.budgetPercentage, 0);
    const addedPct = Number(budgetPercentage) || 0;

    if (currentTotal + addedPct > 100) {
      return NextResponse.json(
        {
          success: false,
          error: `Total budgeting melebihi 100%. Sisa kuota: ${Math.max(0, 100 - currentTotal)}%`,
        },
        { status: 400 }
      );
    }

    const category = await prisma.expenseCategory.create({
      data: {
        name: name.trim(),
        budgetPercentage: addedPct,
        color: color || '#0ea5e9',
        icon: icon || null,
        userId: user.id,
      },
    });

    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Gagal membuat kategori.' },
      { status: 500 }
    );
  }
}
