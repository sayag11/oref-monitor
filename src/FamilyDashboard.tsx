import React from 'react';
import { useAlerts } from './useAlerts';
import { AlertStatus } from './types';
import {
  FamilyGrid,
  FamilyCard,
  FamilyCardIcon,
  FamilyCardLabel,
  FamilyCardCity,
  FamilyCardStatus,
  FamilyCardSpinner,
} from './styles';

interface FamilyMember {
  label: string;
  city: string;
}

const FAMILY_MEMBERS: FamilyMember[] = [
  { label: 'אבא', city: 'ראשון לציון - מזרח' },
  { label: 'אמא', city: 'נס ציונה' },
  { label: 'שיר', city: 'תל אביב - מרכז העיר' },
  { label: 'יהונתן', city: 'גבעתיים' },
];

const STATUS_SHORT: Record<AlertStatus, { icon: string; text: string }> = {
  safe:            { icon: '✅', text: 'שקט — אין איום' },
  near_shelter:    { icon: '⚠️', text: 'הישארו קרוב למרחב מוגן' },
  pre_alert:       { icon: '⚡', text: 'צפויות התרעות' },
  go_to_shelter:   { icon: '🚨', text: 'היכנסו למרחב מוגן!' },
  in_shelter:      { icon: '🛡️', text: 'הישארו במרחב המוגן' },
  connection_lost: { icon: '📡', text: 'אין חיבור' },
};

const FamilyMemberCard: React.FC<{ member: FamilyMember }> = ({ member }) => {
  const { status } = useAlerts(member.city);
  const config = status ? STATUS_SHORT[status] : null;

  return (
    <FamilyCard
      $status={status}
      role="status"
      aria-label={`${member.label} — ${member.city}: ${config?.text ?? 'טוען...'}`}
    >
      {status === null ? (
        <FamilyCardSpinner />
      ) : (
        <FamilyCardIcon $status={status} aria-hidden="true">
          {config!.icon}
        </FamilyCardIcon>
      )}
      <FamilyCardLabel>{member.label}</FamilyCardLabel>
      <FamilyCardCity>{member.city}</FamilyCardCity>
      <FamilyCardStatus $status={status}>
        {config?.text ?? 'טוען...'}
      </FamilyCardStatus>
    </FamilyCard>
  );
};

const FamilyDashboard: React.FC = () => (
  <FamilyGrid aria-label="מצב המשפחה">
    {FAMILY_MEMBERS.map((member) => (
      <FamilyMemberCard key={member.city} member={member} />
    ))}
  </FamilyGrid>
);

export default FamilyDashboard;
