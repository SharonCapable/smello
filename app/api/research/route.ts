import { NextRequest, NextResponse } from 'next/server';

// Docker service URL (configurable via env)
const RESEARCH_SERVICE_URL = process.env.RESEARCH_AGENT_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, frameworkSource } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required and must be a string', success: false },
        { status: 400 }
      );
    }

    // Call the Dockerized research service
    const response = await fetch(`${RESEARCH_SERVICE_URL}/research`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: query.trim(),
        frameworkSource: frameworkSource || null,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Research service error:', errorData);

      // Extract the actual Python error if available
      let errorMessage = errorData.detail?.error || errorData.detail || 'Research service failed';

      return NextResponse.json(
        {
          error: errorMessage,
          success: false,
          status: response.status,
          details: errorData, // Include full error details for debugging
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Return the response from the Docker service
    return NextResponse.json(data);

  } catch (error) {
    console.error('Research API route error:', error);

    // Check if it's a connection error
    if (error instanceof Error && error.message.includes('ECONNREFUSED')) {
      return NextResponse.json(
        {
          error: 'Research service is not running. Please start the Docker container.',
          success: false,
          hint: 'Run: docker run -p 8000:8000 research-agent',
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
        success: false,
      },
      { status: 500 }
    );
  }
}
