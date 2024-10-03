function mapDataForInsert(callHistory) {
  const mappedData = {
    _id: callHistory._id || null,
    number: callHistory.number || null,
    campaign_id: callHistory.campaign?.id || null,
    campaign_name: callHistory.campaign?.name || null,
    company_id: callHistory.company?.id || null,
    company_name: callHistory.company?.name || null,
    phone_type: callHistory.phone_type || null,
    agent_id: callHistory.agent?.id || null,
    agent_name: callHistory.agent?.name || null,
    route_id: callHistory.route?.id || null,
    route_name: callHistory.route?.name || null,
    route_host: callHistory.route?.host || null,
    route_route: callHistory.route?.route || null,
    route_endpoint: callHistory.route?.endpoint || null,
    route_caller_id: callHistory.route?.caller_id || null,
    telephony_id: callHistory.telephony_id || null,
    status: callHistory.status || null,
    qualification_id: callHistory.qualification?.id || null,
    qualification_name: callHistory.qualification?.name || null,
    qualification_behavior: callHistory.qualification?.behavior || null,
    qualification_behavior_text: callHistory.qualification?.behavior_text || null,
    qualification_conversion: callHistory.qualification?.conversion || null,
    qualification_is_dmc: callHistory.qualification?.is_dmc || null,
    billed_time: callHistory.billed_time || null,
    billed_value: callHistory.billed_value || null,
    rate_value: callHistory.rate_value || null,
    amd_status: callHistory.amd_status || null,
    hangup_cause: callHistory.hangup_cause || null,
    recorded: callHistory.recorded ? 1 : 0 || null,
    ended_by_agent: callHistory.ended_by_agent || null,
    qualification_note: callHistory.qualification_note || null,
    sid: callHistory.sid || null,
    call_mode: callHistory.call_mode || null,
    list_id: callHistory.list_id || null,
    list_name: callHistory.list_name || null,
    list_original_name: callHistory.list_original_name || null,
    call_date: callHistory.call_date ? new Date(callHistory.call_date).toISOString() : null,
    calling_time: callHistory.calling_time || null,
    waiting_time: callHistory.waiting_time || null,
    speaking_time: callHistory.speaking_time || null,
    speaking_with_agent_time: callHistory.speaking_with_agent_time || null,
    acw_time: callHistory.acw_time || null,
    receptive_name: callHistory.receptive_name || null,
    receptive_phone: callHistory.receptive_phone || null,
    receptive_did: callHistory.receptive_did || null,
    queue_id: callHistory.queue?.id || null,
    queue_name: callHistory.queue?.name || null,
    ivr_id: callHistory.ivr?.id || null,
    ivr_name: callHistory.ivr?.name || null,
    parent_id: callHistory.parent_id || null,
    random_consult_id: callHistory.random_consult_id || null,
    transfer_recording: callHistory.transfer_recording || null,
    ivr_after_call: callHistory.ivr_after_call || null,
    criteria: callHistory.criteria || null,
    max_time_exceeded: callHistory.max_time_exceeded || null,
    custom_updated_at: callHistory.updated_at ? new Date(callHistory.updated_at).toISOString() : null,
    custom_created_at: callHistory.created_at ? new Date(callHistory.created_at).toISOString() : null,
    hangup_cause_text: callHistory.hangup_cause_text || null,
    hangup_cause_color: callHistory.hangup_cause_color || null,
    hangup_cause_id: callHistory.hangup_cause_id || null,
    mailing_data: JSON.stringify(callHistory.mailing_data) || null,
    identifier: callHistory.mailing_data ? callHistory.mailing_data?.identifier : null,
  };

  return mappedData;
}

function escapeValue(value) {
  if (value === null || value === undefined) {
    return 'NULL';
  } else if (typeof value === 'string') {
    return `'${value.replace(/'/g, "''")}'`;
  } else if (typeof value === 'boolean') {
    return value ? '1' : '0';
  }
  return value;
}

function generateMultiRowInsert(rowDataArray) {
  if (rowDataArray.length === 0) {
    return null;
  }

  const columns = Object.keys(rowDataArray[0]).join(', ');
  const values = rowDataArray.map(rowData => {
    return Object.values(rowData)
      .map(value => escapeValue(value))
      .join(', ');
  });

  return `INSERT INTO bi.dbo.call_history (${columns}) VALUES (${values.join('), (')});`;
}

async function mapCallHistory(data) {
  try {
    return data.map(event => mapDataForInsert(event.callHistory));
  } catch (error) {
    console.error('[MapCallHistory] - Error occurred:', error);
    return [];
  }
}

module.exports = {
  mapCallHistory,
  generateMultiRowInsert
};
