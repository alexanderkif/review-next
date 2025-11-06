import { NextRequest, NextResponse } from 'next/server';
import postgres from 'postgres';
import { verifyAdminAuth } from '../../../lib/admin-auth';
import { auth } from '../../../../auth';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const commentId = parseInt(id);
    
    if (isNaN(commentId)) {
      return NextResponse.json({ error: 'Invalid comment ID' }, { status: 400 });
    }

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content } = await request.json();
    
    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Comment content is required' }, { status: 400 });
    }

    // Get the comment to check ownership
    const existingComment = await sql`
      SELECT user_id FROM project_comments WHERE id = ${commentId}
    `;

    if (existingComment.length === 0) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    const { isAdmin } = await verifyAdminAuth();
    const isOwner = existingComment[0].user_id === Number(session.user.id);

    // Check if user can edit this comment (owner or admin)
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Not authorized to edit this comment' }, { status: 403 });
    }

    // Update the comment
    const updatedComment = await sql`
      UPDATE project_comments 
      SET comment = ${content.trim()}, updated_at = NOW()
      WHERE id = ${commentId}
      RETURNING id, comment as content, created_at, updated_at
    `;

    return NextResponse.json({ 
      message: 'Comment updated successfully',
      comment: updatedComment[0]
    });

  } catch (error) {
    console.error('Error updating comment:', error);
    return NextResponse.json(
      { error: 'Failed to update comment' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const commentId = parseInt(id);
    
    if (isNaN(commentId)) {
      return NextResponse.json({ error: 'Invalid comment ID' }, { status: 400 });
    }

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the comment to check ownership
    const existingComment = await sql`
      SELECT user_id FROM project_comments WHERE id = ${commentId}
    `;

    if (existingComment.length === 0) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    const { isAdmin } = await verifyAdminAuth();
    const isOwner = existingComment[0].user_id === Number(session.user.id);

    // Check if user can delete this comment (owner or admin)
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Not authorized to delete this comment' }, { status: 403 });
    }

    // Delete the comment
    await sql`DELETE FROM project_comments WHERE id = ${commentId}`;

    return NextResponse.json({ 
      message: 'Comment deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    );
  }
}