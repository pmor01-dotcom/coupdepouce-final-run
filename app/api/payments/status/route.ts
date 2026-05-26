import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get('paymentId')

    if (!paymentId) {
      return NextResponse.json(
        { success: false, message: 'ID de paiement requis' },
        { status: 400 }
      )
    }

    // Mock payment status lookup - in production, query database
    const paymentStatus = await getPaymentStatus(paymentId)

    if (!paymentStatus) {
      return NextResponse.json(
        { success: false, message: 'Paiement non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      payment: paymentStatus
    })

  } catch (error) {
    console.error('Payment status error:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la vérification du statut' },
      { status: 500 }
    )
  }
}

async function getPaymentStatus(paymentId: string) {
  // Mock implementation - in production, query database
  // For demo, return a mock payment status
  return {
    id: paymentId,
    status: 'completed',
    amount: 29.99,
    currency: 'EUR',
    createdAt: new Date().toISOString(),
    processedAt: new Date().toISOString()
  }
}
