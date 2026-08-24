import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const filestackApiKey = process.env.NEXT_PUBLIC_FILESTACK_API_KEY;
    
    if (!filestackApiKey || filestackApiKey === 'your_filestack_api_key_here') {
      return NextResponse.json(
        { error: 'Filestack API key not configured' },
        { status: 500 }
      );
    }

    // Create a new FormData for Filestack
    const filestackFormData = new FormData();
    filestackFormData.append('fileUpload', file);

    // Upload to Filestack
    const response = await fetch(
      `https://www.filestackapi.com/api/store/S3?key=${filestackApiKey}`,
      {
        method: 'POST',
        body: filestackFormData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Filestack error:', errorText);
      return NextResponse.json(
        { error: 'Failed to upload to Filestack' },
        { status: 500 }
      );
    }

    const data = await response.json();

    return NextResponse.json({ url: data.url });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
